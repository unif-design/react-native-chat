import { createRef } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { ThemeProvider } from '@unif/react-native-design';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { afterEach, expect, jest, test } from '@jest/globals';
import { MessageList } from '../../../index';
import type { MessageListHandle } from '../../../index';

afterEach(() => {
  jest.restoreAllMocks();
});
const layout = (y: number, height: number) => ({
  nativeEvent: { layout: { x: 0, y, width: 320, height } },
});
const viewport = (height = 400) =>
  fireEvent(screen.getByTestId('messages-list'), 'layout', layout(0, height));
const content = (height: number) =>
  fireEvent(
    screen.getByTestId('messages-list'),
    'contentSizeChange',
    320,
    height
  );
const cell = (key: string, y: number, height: number, leading = 0) => {
  fireEvent(
    screen.getByTestId(`messages-cell-${key}`),
    'layout',
    layout(y, height)
  );
  fireEvent(
    screen.getByTestId(`messages-item-${key}`),
    'layout',
    layout(leading, height - leading)
  );
};
const minimum = () =>
  StyleSheet.flatten(
    screen.UNSAFE_getByType(FlatList).props.contentContainerStyle
  )?.minHeight;

function fixture(initialItems = ['a', 'b']) {
  const scrolling = jest
    .spyOn(FlatList.prototype, 'scrollToOffset')
    .mockImplementation(() => {});
  const locate = jest
    .spyOn(FlatList.prototype, 'scrollToIndex')
    .mockImplementation(() => {});
  const ref = createRef<MessageListHandle>();
  const keyExtractor = (item: string) => item;
  const element = (items = initialItems) => (
    <MessageList
      ref={ref}
      items={items}
      keyExtractor={keyExtractor}
      renderItem={(item) => <Text>{item}</Text>}
      renderSeparator={() => <Text>日期分隔</Text>}
      initialPosition="start"
      followOutput="never"
      contentContainerStyle={{ paddingBottom: 12 }}
      testID="messages"
    />
  );
  const page = render(element(), { wrapper: ThemeProvider });
  const anchor = (key: string) => {
    expect(ref.current?.anchorToItem).toEqual(expect.any(Function));
    act(() =>
      ref.current!.anchorToItem(key, { topOffset: 8, animated: false })
    );
  };
  return { page, element, ref, anchor, scrolling, locate };
}

test.each(['布局先到', '尺寸先到'])(
  '%s：真实行与日期偏移测量、底部撑开完成后才把正文放在顶端8',
  (order) => {
    const f = fixture(['a']);
    viewport();
    content(100);
    f.anchor('b');
    f.page.rerender(f.element(['a', 'b']));
    if (order === '尺寸先到') content(316);
    cell('b', 200, 104, 24);
    expect(minimum()).toBe(616);
    expect(f.scrolling).not.toHaveBeenCalled();
    if (order === '布局先到') content(316);
    expect(f.scrolling).not.toHaveBeenCalled();
    content(616);
    expect(f.scrolling).toHaveBeenLastCalledWith({
      offset: 216,
      animated: false,
    });
    expect(
      screen.UNSAFE_getByType(FlatList).props.maintainVisibleContentPosition
    ).toBeUndefined();
    f.scrolling.mockClear();
    content(1000);
    expect(f.scrolling).not.toHaveBeenCalled();
  }
);

test('视口及目标前方布局变化重申实际锚点，单纯流式增高不追到尾部', () => {
  const f = fixture();
  viewport();
  content(1000);
  cell('b', 200, 104, 24);
  f.anchor('b');
  expect(f.scrolling).toHaveBeenLastCalledWith({
    offset: 216,
    animated: false,
  });
  f.scrolling.mockClear();
  content(1200);
  expect(f.scrolling).not.toHaveBeenCalled();
  viewport(300);
  expect(f.scrolling).toHaveBeenLastCalledWith({
    offset: 216,
    animated: false,
  });
  cell('b', 240, 104, 24);
  expect(f.scrolling).toHaveBeenLastCalledWith({
    offset: 256,
    animated: false,
  });
});

test('手动拖动取消顶锚和撑高，后续内容与视口变化不抢回位置', () => {
  const f = fixture();
  viewport();
  content(1000);
  cell('b', 200, 104, 24);
  f.anchor('b');
  fireEvent(screen.getByTestId('messages-list'), 'scrollBeginDrag');
  expect(minimum()).toBeUndefined();
  expect(
    screen.UNSAFE_getByType(FlatList).props.maintainVisibleContentPosition
  ).toEqual({ minIndexForVisible: 0 });
  f.scrolling.mockClear();
  cell('b', 260, 104, 24);
  content(1100);
  viewport(300);
  expect(f.scrolling).not.toHaveBeenCalled();
});

test('目标删除使原请求失效，同键重新出现或迟到布局不会复活旧请求', () => {
  const f = fixture();
  viewport();
  content(300);
  cell('b', 200, 80);
  f.anchor('b');
  f.page.rerender(f.element(['a']));
  expect(minimum()).toBeUndefined();
  f.page.rerender(f.element(['a', 'b']));
  cell('b', 280, 80);
  content(1000);
  expect(f.scrolling).not.toHaveBeenCalled();
  f.anchor('b');
  expect(f.scrolling).toHaveBeenLastCalledWith({
    offset: 272,
    animated: false,
  });
});

test('显式顶锚在前插时独占定位，取消后重新交回可见内容保持', () => {
  const f = fixture();
  viewport();
  content(1000);
  cell('b', 200, 104, 24);
  f.anchor('b');
  f.scrolling.mockClear();
  f.page.rerender(f.element(['earlier', 'a', 'b']));
  content(1100);
  expect(f.scrolling).not.toHaveBeenCalled();
  // Pure prepend moves the cell, while its existing separator/body offset
  // stays unchanged and need not produce another native onLayout event.
  fireEvent(screen.getByTestId('messages-cell-b'), 'layout', layout(300, 104));
  expect(f.scrolling).toHaveBeenLastCalledWith({
    offset: 316,
    animated: false,
  });
  fireEvent(screen.getByTestId('messages-list'), 'scrollBeginDrag');
  f.scrolling.mockClear();
  f.page.rerender(f.element(['older', 'earlier', 'a', 'b']));
  cell('b', 400, 104, 24);
  content(1200);
  expect(f.scrolling).not.toHaveBeenCalled();
});

test('测量前的请求等待原生视口，屏外估算只负责揭示目标而不宣称定位完成', () => {
  const f = fixture();
  f.anchor('b');
  expect(f.locate).not.toHaveBeenCalled();
  content(1000);
  viewport();
  expect(f.locate).toHaveBeenLastCalledWith({
    index: 1,
    animated: false,
    viewPosition: 0,
  });
  fireEvent(screen.UNSAFE_getByType(FlatList), 'scrollToIndexFailed', {
    index: 1,
    highestMeasuredFrameIndex: 0,
    averageItemLength: 50,
  });
  expect(f.scrolling).toHaveBeenLastCalledWith({ offset: 50, animated: false });
  cell('b', 200, 104, 24);
  expect(f.scrolling).toHaveBeenLastCalledWith({
    offset: 216,
    animated: false,
  });
});

test('请求目标尚未加入时用户拖动取消，后来的受控加入不覆盖用户位置', () => {
  const f = fixture(['a']);
  viewport();
  content(600);
  f.anchor('b');
  fireEvent(screen.getByTestId('messages-list'), 'scrollBeginDrag');
  f.page.rerender(f.element(['a', 'b']));
  cell('b', 600, 100, 24);
  content(900);
  expect(f.scrolling).not.toHaveBeenCalled();
});

test('回到末尾先撤撑高，等原生内容收缩后落到真实末尾，不落旧空白', () => {
  const f = fixture();
  viewport();
  content(316);
  cell('b', 200, 104, 24);
  f.anchor('b');
  content(616);
  f.scrolling.mockClear();
  act(() => f.ref.current!.scrollToEnd({ animated: false }));
  expect(minimum()).toBeUndefined();
  expect(f.scrolling).not.toHaveBeenCalled();
  content(316);
  expect(f.scrolling).toHaveBeenLastCalledWith({ offset: 0, animated: false });
  f.scrolling.mockClear();
  cell('b', 240, 104, 24);
  content(356);
  expect(f.scrolling).not.toHaveBeenCalled();
});

test('撤撑高同时末条变高抵消总高变化时，真实行布局也能完成回到底部请求', () => {
  const f = fixture();
  viewport();
  content(316);
  cell('b', 200, 104, 24);
  f.anchor('b');
  content(616);
  f.scrolling.mockClear();
  act(() => f.ref.current!.scrollToEnd({ animated: false }));
  expect(f.scrolling).not.toHaveBeenCalled();
  // The last row grows by the removed blank area; total content stays 616,
  // so native need not dispatch another content-size event.
  cell('b', 200, 404, 24);
  expect(f.scrolling).toHaveBeenLastCalledWith({
    offset: 216,
    animated: false,
  });
});
