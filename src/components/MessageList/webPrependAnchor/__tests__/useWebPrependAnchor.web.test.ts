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
  rows: FakeElement[] = [];
  listeners = new Map<string, Set<() => void>>();

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

  constructor(callback: () => void) {
    this.callback = callback;
    FakeObserver.instances.push(this);
  }

  observe() {}
  unobserve() {}
  disconnect() {
    this.disconnected = true;
  }
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
    MutationObserver: FakeObserver,
    ResizeObserver: FakeObserver,
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
