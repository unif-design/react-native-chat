import type { RefObject } from 'react';
import type {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import { useMessageListScroll } from '../useMessageListScroll';

type Options = Parameters<typeof useMessageListScroll<string>>[0];
const layout = (height = 400, width = 320): LayoutChangeEvent =>
  ({
    nativeEvent: { layout: { x: 0, y: 0, width, height } },
  }) as LayoutChangeEvent;
const cell = (y: number, height = 100) => ({ x: 0, y, width: 320, height });
const scroll = (
  offset: number,
  content = 1000,
  viewport = 400,
  velocity?: number
): NativeSyntheticEvent<NativeScrollEvent> =>
  ({
    nativeEvent: {
      contentOffset: { x: 0, y: offset },
      contentSize: { width: 320, height: content },
      layoutMeasurement: { width: 320, height: viewport },
      velocity: velocity === undefined ? undefined : { x: 0, y: velocity },
    },
  }) as NativeSyntheticEvent<NativeScrollEvent>;
function fixture(overrides: Partial<Options> = {}) {
  const scrolling = jest.fn();
  const locating = jest.fn();
  const onAtEndChange = jest.fn();
  const options: Options = {
    listRef: {
      current: { scrollToOffset: scrolling, scrollToIndex: locating },
    } as unknown as RefObject<FlatList<string> | null>,
    keys: ['a', 'b'],
    initialPosition: 'start',
    followOutput: 'whenAtEnd',
    onAtEndChange,
    preservingPrependRef: { current: false },
    cancelPrependPreservation: jest.fn(),
    ...overrides,
  };
  const hook = renderHook((props: Options) => useMessageListScroll(props), {
    initialProps: options,
  });
  const ready = () =>
    act(() => {
      hook.result.current.onLayout(layout());
      hook.result.current.onContentSizeChange(320, 1000);
    });
  return { ...hook, options, scrolling, locating, onAtEndChange, ready };
}

test('尺寸尚未就绪时不广播末尾状态，显式末尾请求等到布局后执行', () => {
  const f = fixture({ keys: [], endThreshold: NaN });
  act(() => {
    f.result.current.onScroll(scroll(0, 0, 0));
    f.result.current.scrollToEnd();
  });
  expect(f.scrolling).not.toHaveBeenCalled();
  expect(f.onAtEndChange).not.toHaveBeenCalled();
  act(() => {
    f.result.current.onContentSizeChange(320, 100);
    f.result.current.onLayout(layout());
  });
  expect(f.scrolling).toHaveBeenLastCalledWith({ offset: 0, animated: true });
  expect(f.onAtEndChange).toHaveBeenLastCalledWith(true);
});

test('手势和惯性滚动期间不跟随，停止后恢复末尾跟随', () => {
  const f = fixture();
  f.ready();
  act(() => f.result.current.onScroll(scroll(600)));
  f.scrolling.mockClear();
  act(() => {
    f.result.current.onMomentumScrollBegin();
    f.result.current.onContentSizeChange(320, 1100);
  });
  expect(f.scrolling).not.toHaveBeenCalled();
  act(() => f.result.current.onScrollEndDrag(scroll(700, 1100, 400, 2)));
  act(() => f.result.current.onContentSizeChange(320, 1200));
  expect(f.scrolling).not.toHaveBeenCalled();
  act(() => f.result.current.onMomentumScrollEnd(scroll(800, 1200)));
  act(() => f.result.current.onContentSizeChange(320, 1300));
  expect(f.scrolling).toHaveBeenLastCalledWith({
    offset: 900,
    animated: false,
  });
  f.scrolling.mockClear();
  act(() => {
    f.result.current.onUserScrollBegin();
    f.result.current.onScrollEndDrag(scroll(900, 1300));
    f.result.current.onContentSizeChange(320, 1400);
  });
  expect(f.scrolling).toHaveBeenLastCalledWith({
    offset: 1000,
    animated: false,
  });
  act(() => {
    f.result.current.onUserScrollBegin();
    f.result.current.onScrollEndDrag(scroll(1000, 1400, 400, 0));
  });
  expect(f.result.current.atEnd).toBe(true);
});

test('无效和旧单元布局不改变锚点，回收后定位失败使用有效估计', () => {
  const f = fixture();
  f.ready();
  act(() => {
    f.result.current.onCellLayout('wrong', 0, cell(0));
    f.result.current.onCellLayout('a', 0, cell(NaN));
    f.result.current.onCellLayout('a', 0, cell(0, Infinity));
    f.result.current.onItemLayout('wrong', 0, 0);
    f.result.current.onItemLayout('a', 0, NaN);
    f.result.current.onScrollToIndexFailed({
      index: 1,
      averageItemLength: 100,
      highestMeasuredFrameIndex: 0,
    });
    f.result.current.anchorToItem('b', { topOffset: NaN });
  });
  expect(f.locating).toHaveBeenCalledWith({
    index: 1,
    animated: false,
    viewPosition: 0,
  });
  for (const failure of [
    { index: 0, averageItemLength: 100 },
    { index: 1, averageItemLength: NaN },
    { index: 1, averageItemLength: 0 },
  ])
    act(() =>
      f.result.current.onScrollToIndexFailed({
        ...failure,
        highestMeasuredFrameIndex: 0,
      })
    );
  expect(f.scrolling).not.toHaveBeenCalled();
  act(() =>
    f.result.current.onScrollToIndexFailed({
      index: 1,
      averageItemLength: 75,
      highestMeasuredFrameIndex: 0,
    })
  );
  expect(f.scrolling).toHaveBeenLastCalledWith({ offset: 75, animated: false });
  act(() => {
    f.result.current.onItemLayout('b', 1, 20);
    f.result.current.onCellLayout('b', 1, cell(200));
  });
  expect(f.scrolling).toHaveBeenLastCalledWith({ offset: 220, animated: true });
  f.scrolling.mockClear();
  act(() => {
    f.result.current.onCellUnmount('b', 0);
    f.result.current.onItemLayout('b', 1, 20);
  });
  expect(f.scrolling).not.toHaveBeenCalled();
  f.locating.mockClear();
  act(() => {
    f.result.current.onCellUnmount('b', 1);
    f.result.current.onFooterLayout(layout(20));
  });
  expect(f.locating).toHaveBeenCalledTimes(1);
});

test.each([
  ['150%', 600],
  ['bad%', 400],
  ['auto', 400],
  [-20, 400],
] as const)(
  '内容最小高度 %s 使用布局单位计算',
  (contentMinimumHeight, expected) => {
    const f = fixture({
      keys: ['a'],
      contentMinimumHeight,
      contentBottomPadding: '10%',
      hasFooter: true,
    });
    f.ready();
    act(() => {
      f.result.current.onCellLayout('a', 0, cell(0, 100));
      f.result.current.onItemLayout('a', 0, 0);
      f.result.current.onFooterLayout(layout(20));
      f.result.current.anchorToItem('a', { topOffset: -10, animated: false });
    });
    expect(f.result.current.anchorMinimumHeight).toBe(expected);
    act(() => f.result.current.scrollToEnd());
    expect(f.result.current.anchorMinimumHeight).toBeUndefined();
  }
);

test('末尾请求释放临时撑高后等待自然布局，移除测量不会提前滚动', () => {
  const f = fixture({ keys: ['a', 'b'] });
  f.ready();
  act(() => {
    f.result.current.onCellLayout('a', 0, cell(0));
    f.result.current.onItemLayout('a', 0, 0);
    f.result.current.onCellLayout('b', 1, cell(100));
    f.result.current.onItemLayout('b', 1, 0);
    f.result.current.anchorToItem('b');
    f.result.current.onContentSizeChange(320, 500);
  });
  f.scrolling.mockClear();
  act(() => f.result.current.scrollToEnd());
  expect(f.scrolling).not.toHaveBeenCalled();
  act(() => {
    f.result.current.onCellUnmount('b', 1);
    f.result.current.onContentSizeChange(320, 500);
    f.result.current.onFooterLayout(layout(0));
  });
  expect(f.scrolling).not.toHaveBeenCalled();
  act(() => f.result.current.onCellLayout('b', 1, cell(100)));
  act(() => f.result.current.onContentSizeChange(320, 200));
  expect(f.scrolling).toHaveBeenLastCalledWith({ offset: 0, animated: true });
});

test('锚点滚动到位后的普通滚轮移动解除锚点，几何变化期间继续保持', () => {
  const f = fixture();
  f.ready();
  act(() => {
    f.result.current.onCellLayout('b', 1, cell(200));
    f.result.current.onItemLayout('b', 1, 0);
    f.result.current.anchorToItem('b', { animated: false });
    f.result.current.onScroll(scroll(200));
  });
  expect(f.result.current.anchorMinimumHeight).toBe(600);
  act(() => f.result.current.onScroll(scroll(210, 1100)));
  expect(f.result.current.anchorMinimumHeight).toBe(600);
  act(() => f.result.current.onScroll(scroll(220, 1100)));
  expect(f.result.current.anchorMinimumHeight).toBeUndefined();
});

test('集合变更清除移走的测量，保持同索引测量，并等待尚未出现的锚点', () => {
  const f = fixture();
  f.ready();
  act(() => {
    f.result.current.onCellLayout('a', 0, cell(0));
    f.result.current.onItemLayout('a', 0, 0);
    f.result.current.onCellLayout('b', 1, cell(100));
    f.result.current.onItemLayout('b', 1, 0);
  });
  f.rerender({ ...f.options, keys: ['a', 'c'] });
  act(() => f.result.current.anchorToItem('b', { animated: false }));
  expect(f.scrolling).not.toHaveBeenCalled();
  f.rerender({ ...f.options, keys: ['a', 'c', 'd'] });
  expect(f.scrolling).not.toHaveBeenCalled();
  f.rerender({ ...f.options, keys: ['a', 'b', 'c', 'd'] });
  expect(f.locating).toHaveBeenLastCalledWith({
    index: 1,
    animated: false,
    viewPosition: 0,
  });
  act(() => {
    f.result.current.onCellLayout('b', 1, cell(300));
    f.result.current.onItemLayout('b', 1, 0);
  });
  expect(f.scrolling).toHaveBeenLastCalledWith({
    offset: 300,
    animated: false,
  });
});

test('末尾尺寸变化前保持跟随意图，稳定几何和never模式正常公布位置', () => {
  const f = fixture();
  f.ready();
  act(() => f.result.current.onScroll(scroll(600)));
  f.onAtEndChange.mockClear();
  act(() => f.result.current.onScroll(scroll(600, 1200)));
  expect(f.onAtEndChange).not.toHaveBeenCalled();
  expect(f.result.current.atEnd).toBe(true);
  act(() => f.result.current.onContentSizeChange(320, 1200));
  expect(f.scrolling).toHaveBeenLastCalledWith({
    offset: 800,
    animated: false,
  });
  act(() => f.result.current.onScroll(scroll(800, 1200)));
  expect(f.result.current.atEnd).toBe(true);
  f.rerender({ ...f.options, followOutput: 'never' });
  act(() => f.result.current.onScroll(scroll(800, 1500)));
  expect(f.onAtEndChange).toHaveBeenLastCalledWith(false);
});

test.each(['content-first', 'scroll-first'])(
  'never 模式在末尾时输入区留白先变化，随后键盘收窄视口仍贴底：%s',
  (order) => {
    const f = fixture({ followOutput: 'never', contentBottomPadding: 100 });
    f.ready();
    act(() => f.result.current.onScroll(scroll(600)));
    f.scrolling.mockClear();
    f.rerender({ ...f.options, contentBottomPadding: 200 });
    if (order === 'scroll-first') {
      act(() => f.result.current.onScroll(scroll(600, 1100)));
    }
    act(() => f.result.current.onContentSizeChange(320, 1100));
    if (order === 'content-first') {
      act(() => f.result.current.onScroll(scroll(600, 1100)));
    }
    act(() => f.result.current.onLayout(layout(200)));
    expect(f.scrolling).toHaveBeenLastCalledWith({
      offset: 900,
      animated: false,
    });
    act(() => f.result.current.onScroll(scroll(900, 1100, 200)));
    expect(f.result.current.atEnd).toBe(true);
    f.scrolling.mockClear();
    act(() => f.result.current.onContentSizeChange(320, 1200));
    expect(f.scrolling).not.toHaveBeenCalled();
    expect(f.result.current.atEnd).toBe(false);
  }
);

test('输入区留白变化不抢回历史阅读位置，用户拖动取消布局跟随', () => {
  const f = fixture({ followOutput: 'never', contentBottomPadding: 100 });
  f.ready();
  act(() => f.result.current.onScroll(scroll(200)));
  f.scrolling.mockClear();
  f.rerender({ ...f.options, contentBottomPadding: 200 });
  act(() => f.result.current.onContentSizeChange(320, 1100));
  act(() => f.result.current.onLayout(layout(200)));
  expect(f.scrolling).not.toHaveBeenCalled();
  act(() => f.result.current.onScroll(scroll(900, 1100, 200)));
  f.rerender({ ...f.options, contentBottomPadding: 250 });
  act(() => f.result.current.onUserScrollBegin());
  act(() => f.result.current.onScroll(scroll(700, 1150, 200)));
  act(() => f.result.current.onContentSizeChange(320, 1150));
  expect(f.scrolling).not.toHaveBeenCalled();
});

test.each(['drag', 'anchor', 'prepend'])(
  '输入区变高时已有%s定位优先于末尾布局跟随',
  (mode) => {
    const f = fixture({ followOutput: 'never', contentBottomPadding: 100 });
    f.ready();
    act(() => f.result.current.onScroll(scroll(600)));
    if (mode === 'drag') act(() => f.result.current.onUserScrollBegin());
    if (mode === 'anchor') act(() => f.result.current.anchorToItem('b'));
    if (mode === 'prepend') f.options.preservingPrependRef.current = true;
    f.scrolling.mockClear();
    f.rerender({ ...f.options, contentBottomPadding: 200 });
    act(() => f.result.current.onContentSizeChange(320, 1100));
    act(() => f.result.current.onLayout(layout(200)));
    expect(f.scrolling).not.toHaveBeenCalled();
  }
);

test('Web 滚轮在布局跟随途中向上阅读时结束跟随，不等 drag 事件', () => {
  const f = fixture({ followOutput: 'never', contentBottomPadding: 100 });
  f.ready();
  act(() => f.result.current.onScroll(scroll(600)));
  f.rerender({ ...f.options, contentBottomPadding: 200 });
  act(() => f.result.current.onContentSizeChange(320, 1100));
  f.scrolling.mockClear();
  act(() => f.result.current.onScroll(scroll(400, 1100)));
  act(() => f.result.current.onLayout(layout(200)));
  expect(f.scrolling).not.toHaveBeenCalled();
  expect(f.result.current.atEnd).toBe(false);
});

test.each(['onMomentumScrollEnd', 'onScrollEndDrag'] as const)(
  '原生迟到的%s回调不能撤销输入区布局正在保持的末尾位置',
  (event) => {
    const f = fixture({ followOutput: 'never', contentBottomPadding: 100 });
    f.ready();
    act(() => f.result.current.onScroll(scroll(600)));
    f.rerender({ ...f.options, contentBottomPadding: 200 });
    act(() => f.result.current.onContentSizeChange(320, 1100));
    act(() => f.result.current[event](scroll(600, 1100)));
    expect(f.result.current.atEnd).toBe(true);
    f.scrolling.mockClear();
    act(() => f.result.current.onLayout(layout(200)));
    expect(f.scrolling).toHaveBeenLastCalledWith({
      offset: 900,
      animated: false,
    });
    act(() => f.result.current.onScroll(scroll(900, 1100, 200)));
    expect(f.result.current.atEnd).toBe(true);
  }
);
