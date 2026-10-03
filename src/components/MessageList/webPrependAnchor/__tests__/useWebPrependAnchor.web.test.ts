import { createRef } from 'react';
import { Platform } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import { useWebPrependAnchor } from '../useWebPrependAnchor.web';
import type {
  UseWebPrependAnchorOptions,
  WebPrependAnchorListHandle,
  WebPrependScrollToOffsetOptions,
} from '../types';

interface Rect {
  top: number;
  bottom: number;
}

class FakeElement {
  id = '';
  scrollTop = 0;
  scrollHeight = 1000;
  rect: Rect = { top: 100, bottom: 500 };
  children: FakeElement[] = [];
  rows: FakeElement[] = [];
  innerView: FakeElement | undefined;
  listeners = new Map<string, Set<() => void>>();

  getInnerViewNode() {
    return this.innerView;
  }

  getBoundingClientRect() {
    return this.rect;
  }

  querySelectorAll() {
    return this.rows;
  }

  contains(candidate: unknown) {
    return this === candidate || this.rows.includes(candidate as FakeElement);
  }

  addEventListener(type: string, listener: () => void) {
    const listeners = this.listeners.get(type) ?? new Set<() => void>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: () => void) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatch(type: string) {
    this.listeners.get(type)?.forEach((listener) => listener());
  }
}

class FakeObserver {
  static instances: FakeObserver[] = [];
  readonly callback: () => void;
  disconnected = false;
  targets = new Set<unknown>();

  constructor(callback: () => void) {
    this.callback = callback;
    FakeObserver.instances.push(this);
  }

  observe(target: unknown) {
    this.targets.add(target);
  }
  unobserve(target: unknown) {
    this.targets.delete(target);
  }
  disconnect() {
    this.disconnected = true;
    this.targets.clear();
  }
}

class FakeResizeObserver extends FakeObserver {}
class FakeMutationObserver extends FakeObserver {}

function resize(target: FakeElement) {
  FakeObserver.instances.forEach((observer) => {
    if (observer instanceof FakeResizeObserver && observer.targets.has(target))
      observer.callback();
  });
}

function mutate(target: FakeElement) {
  FakeObserver.instances.forEach((observer) => {
    if (
      observer instanceof FakeMutationObserver &&
      observer.targets.has(target)
    )
      observer.callback();
  });
}

const frames = new Map<number, () => void>();
let nextFrame = 1;
const WEB_GLOBAL_KEYS = [
  'document',
  'MutationObserver',
  'ResizeObserver',
  'requestAnimationFrame',
  'cancelAnimationFrame',
] as const;
let originalGlobalDescriptors = new Map<
  (typeof WEB_GLOBAL_KEYS)[number],
  PropertyDescriptor | undefined
>();

function flushFrames() {
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach((callback) => callback());
}

function installWebGlobals(elements: Map<string, FakeElement>) {
  const replacements = {
    document: {
      getElementById: (id: string) => elements.get(id) ?? null,
    },
    MutationObserver: FakeMutationObserver,
    ResizeObserver: FakeResizeObserver,
    requestAnimationFrame: (callback: () => void) => {
      const frame = nextFrame++;
      frames.set(frame, callback);
      return frame;
    },
    cancelAnimationFrame: (frame: number) => frames.delete(frame),
  };
  WEB_GLOBAL_KEYS.forEach((key) =>
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value: replacements[key],
    })
  );
}

function createRow(id: string, top: number, bottom = top + 40) {
  const row = new FakeElement();
  row.id = id;
  row.rect = { top, bottom };
  return row;
}

beforeEach(() => {
  jest.replaceProperty(Platform, 'OS', 'web');
  originalGlobalDescriptors = new Map(
    WEB_GLOBAL_KEYS.map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ])
  );
  FakeObserver.instances = [];
  frames.clear();
  nextFrame = 1;
});

afterEach(() => {
  jest.restoreAllMocks();
  WEB_GLOBAL_KEYS.forEach((key) => {
    const descriptor = originalGlobalDescriptors.get(key);
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  });
});

test('纯前插后按同一可见行精确恢复，并继续跟随异步尺寸变化', () => {
  const scroller = new FakeElement();
  scroller.scrollTop = 100;
  const elements = new Map<string, FakeElement>();
  installWebGlobals(elements);
  const scrollToOffset = jest.fn(
    ({ offset }: WebPrependScrollToOffsetOptions) => {
      const delta = offset - scroller.scrollTop;
      scroller.rows.forEach((row) => {
        row.rect = {
          top: row.rect.top - delta,
          bottom: row.rect.bottom - delta,
        };
      });
      scroller.scrollTop = offset;
    }
  );
  const listRef = createRef<WebPrependAnchorListHandle>();
  listRef.current = {
    getScrollableNode: () => scroller,
    scrollToOffset,
  };
  const firstItems = {};
  const { result, rerender, unmount } = renderHook(
    (options: Omit<UseWebPrependAnchorOptions, 'listRef'>) =>
      useWebPrependAnchor({ ...options, listRef }),
    { initialProps: { itemsIdentity: firstItems, keys: ['a', 'b'] } }
  );

  const anchor = createRow(result.current.getRowNativeID('a'), 120);
  const second = createRow(result.current.getRowNativeID('b'), 160);
  scroller.rows = [anchor, second];
  elements.set(anchor.id, anchor);
  elements.set(second.id, second);
  act(() => {
    FakeObserver.instances.forEach((observer) => observer.callback());
    flushFrames();
  });

  rerender({ itemsIdentity: {}, keys: ['new', 'a', 'b'] });
  anchor.rect = { top: 220, bottom: 260 };
  act(() => {
    FakeObserver.instances.forEach((observer) => observer.callback());
    flushFrames();
  });
  expect(scrollToOffset).toHaveBeenLastCalledWith({
    offset: 200,
    animated: false,
  });
  expect(result.current.preservingPrependRef.current).toBe(true);

  anchor.rect = { top: 160, bottom: 200 };
  act(() => {
    FakeObserver.instances.forEach((observer) => observer.callback());
    flushFrames();
  });
  expect(scrollToOffset).toHaveBeenLastCalledWith({
    offset: 240,
    animated: false,
  });

  act(() => scroller.dispatch('wheel'));
  expect(result.current.preservingPrependRef.current).toBe(false);
  unmount();
  expect(
    FakeObserver.instances.every((observer) => observer.disconnected)
  ).toBe(true);
});

test('旧锚点暂未渲染时先按总高度差补偿，非纯前插和显式滚末尾会取消保持', () => {
  const scroller = new FakeElement();
  scroller.scrollTop = 80;
  const elements = new Map<string, FakeElement>();
  installWebGlobals(elements);
  const scrollToOffset = jest.fn(
    ({ offset }: WebPrependScrollToOffsetOptions) => {
      const delta = offset - scroller.scrollTop;
      scroller.rows.forEach((row) => {
        row.rect = {
          top: row.rect.top - delta,
          bottom: row.rect.bottom - delta,
        };
      });
      scroller.scrollTop = offset;
    }
  );
  const listRef = createRef<WebPrependAnchorListHandle>();
  listRef.current = {
    getScrollableNode: () => scroller,
    scrollToOffset,
  };
  const { result, rerender, unmount } = renderHook(
    (options: Omit<UseWebPrependAnchorOptions, 'listRef'>) =>
      useWebPrependAnchor({ ...options, listRef }),
    { initialProps: { itemsIdentity: {}, keys: ['a', 'b'] } }
  );
  const anchor = createRow(result.current.getRowNativeID('a'), 120);
  scroller.rows = [anchor];
  elements.set(anchor.id, anchor);
  act(() => {
    FakeObserver.instances.forEach((observer) => observer.callback());
    flushFrames();
  });

  rerender({ itemsIdentity: {}, keys: ['new', 'a', 'b'] });
  scroller.rows = [];
  elements.delete(anchor.id);
  scroller.scrollHeight = 1400;
  act(() => {
    FakeObserver.instances.forEach((observer) => observer.callback());
    flushFrames();
  });
  expect(scrollToOffset).toHaveBeenLastCalledWith({
    offset: 480,
    animated: false,
  });

  rerender({ itemsIdentity: {}, keys: ['new', 'a', 'b', 'later'] });
  expect(result.current.preservingPrependRef.current).toBe(false);

  anchor.rect = { top: 120, bottom: 160 };
  scroller.rows = [anchor];
  elements.set(anchor.id, anchor);
  act(() => {
    FakeObserver.instances.forEach((observer) => observer.callback());
    flushFrames();
  });
  rerender({ itemsIdentity: {}, keys: ['older', 'new', 'a', 'b', 'later'] });
  expect(result.current.preservingPrependRef.current).toBe(true);
  act(() => result.current.cancelPrependPreservation());
  expect(result.current.preservingPrependRef.current).toBe(false);
  unmount();
});

test('unchanged list inputs do not rescan DOM rows; resize still refreshes the anchor', () => {
  const scroller = new FakeElement();
  const elements = new Map<string, FakeElement>();
  installWebGlobals(elements);
  const listRef = createRef<WebPrependAnchorListHandle>();
  listRef.current = {
    getScrollableNode: () => scroller,
    scrollToOffset: jest.fn(),
  };
  const options = { itemsIdentity: {}, keys: ['a', 'b'] };
  const { result, rerender } = renderHook(
    (input: Omit<UseWebPrependAnchorOptions, 'listRef'>) =>
      useWebPrependAnchor({ ...input, listRef }),
    { initialProps: options }
  );
  const anchor = createRow(result.current.getRowNativeID('a'), 120);
  scroller.rows = [anchor];
  elements.set(anchor.id, anchor);
  act(flushFrames);
  const queryRows = jest.spyOn(scroller, 'querySelectorAll');

  rerender(options);
  act(flushFrames);

  expect(queryRows).not.toHaveBeenCalled();
  act(() => {
    anchor.rect = { top: 120, bottom: 200 };
    resize(anchor);
    flushFrames();
  });
  expect(queryRows).toHaveBeenCalled();
});

test('header height changes refresh the anchor before the next prepend without resizing a row or the viewport', () => {
  const scroller = new FakeElement();
  const content = new FakeElement();
  scroller.innerView = content;
  const elements = new Map<string, FakeElement>();
  installWebGlobals(elements);
  const scrollToOffset = jest.fn();
  const listRef = createRef<WebPrependAnchorListHandle>();
  listRef.current = {
    getScrollableNode: () => scroller,
    scrollToOffset,
  };
  const options = { itemsIdentity: {}, keys: ['a', 'b'] };
  const { result, rerender } = renderHook(
    (input: Omit<UseWebPrependAnchorOptions, 'listRef'>) =>
      useWebPrependAnchor({ ...input, listRef }),
    { initialProps: options }
  );
  const anchor = createRow(result.current.getRowNativeID('a'), 200);
  scroller.rows = [anchor];
  elements.set(anchor.id, anchor);
  act(flushFrames);

  // RN Web's content container grows when only header.style.height changes.
  // The viewport, row sizes, child list and scroll offset stay unchanged.
  anchor.rect = { top: 280, bottom: 320 };
  content.rect = { top: 100, bottom: 1180 };
  scroller.scrollHeight = 1080;
  rerender(options);
  act(() => {
    resize(content);
    flushFrames();
  });
  expect(scrollToOffset).not.toHaveBeenCalled();

  rerender({ itemsIdentity: {}, keys: ['new', 'a', 'b'] });
  anchor.rect = { top: 380, bottom: 420 };
  act(flushFrames);

  expect(scrollToOffset).toHaveBeenLastCalledWith({
    offset: 100,
    animated: false,
  });
});

test('replacement content is observed and unmount releases its observers, listeners and pending frame', () => {
  const scroller = new FakeElement();
  const oldContent = new FakeElement();
  const newContent = new FakeElement();
  const oldHeader = new FakeElement();
  const newHeader = new FakeElement();
  oldContent.children = [oldHeader];
  newContent.children = [newHeader];
  scroller.innerView = oldContent;
  installWebGlobals(new Map());
  const listRef = createRef<WebPrependAnchorListHandle>();
  listRef.current = {
    getScrollableNode: () => scroller,
    scrollToOffset: jest.fn(),
  };
  const { unmount } = renderHook(() =>
    useWebPrependAnchor({ listRef, itemsIdentity: {}, keys: [] })
  );
  act(flushFrames);
  const queryRows = jest.spyOn(scroller, 'querySelectorAll');
  scroller.innerView = newContent;
  act(() => {
    mutate(scroller);
    flushFrames();
  });
  queryRows.mockClear();

  act(() => {
    resize(oldContent);
    resize(oldHeader);
    flushFrames();
  });
  expect(queryRows).not.toHaveBeenCalled();
  act(() => {
    newContent.rect = { top: 100, bottom: 1200 };
    resize(newContent);
    flushFrames();
  });
  expect(queryRows).toHaveBeenCalled();

  queryRows.mockClear();
  act(() => {
    resize(newHeader);
    flushFrames();
  });
  expect(queryRows).toHaveBeenCalled();

  queryRows.mockClear();
  act(() => resize(newHeader));
  expect(frames.size).toBe(1);
  unmount();
  expect(frames.size).toBe(0);
  expect(
    FakeObserver.instances.every((observer) => observer.disconnected)
  ).toBe(true);
  expect([...scroller.listeners.values()].every((set) => set.size === 0)).toBe(
    true
  );
  act(() => {
    resize(newContent);
    resize(newHeader);
    scroller.dispatch('scroll');
    flushFrames();
  });
  expect(queryRows).not.toHaveBeenCalled();
});

test('opposite header and footer resizes refresh the anchor when total content height is unchanged', () => {
  const scroller = new FakeElement();
  const content = new FakeElement();
  const header = createRow('header-wrapper', 100, 200);
  const footer = createRow('footer-wrapper', 328, 1328);
  const cell = createRow('cell-wrapper', 200, 264);
  const secondCell = createRow('second-cell-wrapper', 264, 328);
  content.rect = { top: 100, bottom: 1328 };
  content.children = [header, cell, secondCell, footer];
  scroller.innerView = content;
  scroller.scrollHeight = 1228;
  const elements = new Map<string, FakeElement>();
  installWebGlobals(elements);
  const scrollToOffset = jest.fn();
  const listRef = createRef<WebPrependAnchorListHandle>();
  listRef.current = {
    getScrollableNode: () => scroller,
    scrollToOffset,
  };
  const options = { itemsIdentity: {}, keys: ['a', 'b'] };
  const { result, rerender } = renderHook(
    (input: Omit<UseWebPrependAnchorOptions, 'listRef'>) =>
      useWebPrependAnchor({ ...input, listRef }),
    { initialProps: options }
  );
  const anchor = createRow(result.current.getRowNativeID('a'), 200, 264);
  cell.children = [anchor];
  scroller.rows = [anchor];
  elements.set(anchor.id, anchor);
  act(flushFrames);

  // Only the two wrappers resize: +80 and -80 cancel in the content box.
  header.rect = { top: 100, bottom: 280 };
  footer.rect = { top: 408, bottom: 1328 };
  cell.rect = { top: 280, bottom: 344 };
  secondCell.rect = { top: 344, bottom: 408 };
  anchor.rect = { top: 280, bottom: 344 };
  rerender(options);
  act(() => {
    resize(header);
    resize(footer);
    flushFrames();
  });
  expect(scrollToOffset).not.toHaveBeenCalled();

  rerender({ itemsIdentity: {}, keys: ['new', 'a', 'b'] });
  anchor.rect = { top: 380, bottom: 444 };
  act(flushFrames);
  expect(scrollToOffset).toHaveBeenLastCalledWith({
    offset: 100,
    animated: false,
  });
});
