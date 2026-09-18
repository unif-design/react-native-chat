import { createRef } from 'react';
import { FlatList, Platform, Text } from 'react-native';
import { ThemeProvider } from '@unif/react-native-design';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { afterEach, describe, expect, jest, test } from '@jest/globals';
import { MessageList } from '..';
import type { MessageListHandle, MessageListProps } from '..';

const items = ['a', 'b', 'c'];
const props: MessageListProps<string> = {
  items,
  keyExtractor: (item) => item,
  renderItem: (item) => <Text>{item}</Text>,
  testID: 'messages',
};
const measure = (height = 1000, viewport = 400) => {
  fireEvent(screen.getByTestId('messages-list'), 'layout', {
    nativeEvent: { layout: { width: 320, height: viewport, x: 0, y: 0 } },
  });
  fireEvent(
    screen.getByTestId('messages-list'),
    'contentSizeChange',
    320,
    height
  );
};
const scroll = (offset: number, height = 1000, viewport = 400) =>
  fireEvent.scroll(screen.getByTestId('messages-list'), {
    nativeEvent: {
      contentOffset: { y: offset, x: 0 },
      contentSize: { width: 320, height },
      layoutMeasurement: { width: 320, height: viewport },
    },
  });

afterEach(() => {
  jest.restoreAllMocks();
});
describe('MessageList', () => {
  test('保持集合顺序，历史只由明确按钮请求且加载时不可用', () => {
    const earlier = jest.fn();
    const view = render(
      <MessageList {...props} hasEarlier onRequestEarlier={earlier} />,
      { wrapper: ThemeProvider }
    );
    expect(
      screen.getAllByText(/^[abc]$/).map((node) => node.props.children)
    ).toEqual(items);
    expect(earlier).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: '查看更早消息' }));
    expect(earlier).toHaveBeenCalledTimes(1);
    view.rerender(
      <MessageList
        {...props}
        hasEarlier
        loadingEarlier
        onRequestEarlier={earlier}
      />
    );
    expect(screen.getByRole('button', { name: '正在加载…' })).toBeDisabled();
    view.rerender(<MessageList {...props} hasEarlier />);
    expect(screen.queryByRole('button', { name: '查看更早消息' })).toBeNull();
  });

  test('首次非空定位一次，后续流式增高只在末尾跟随', () => {
    const scrollToEnd = jest
      .spyOn(FlatList.prototype, 'scrollToOffset')
      .mockImplementation(() => {});
    const onAtEndChange = jest.fn();
    render(<MessageList {...props} onAtEndChange={onAtEndChange} />, {
      wrapper: ThemeProvider,
    });
    expect(scrollToEnd).not.toHaveBeenCalled();
    measure();
    expect(scrollToEnd).toHaveBeenLastCalledWith({
      offset: 600,
      animated: false,
    });
    scroll(600);
    scrollToEnd.mockClear();
    fireEvent(
      screen.getByTestId('messages-list'),
      'contentSizeChange',
      320,
      1100
    );
    expect(scrollToEnd).toHaveBeenCalledTimes(1);
    scroll(100, 1100);
    scrollToEnd.mockClear();
    fireEvent(
      screen.getByTestId('messages-list'),
      'contentSizeChange',
      320,
      1200
    );
    expect(scrollToEnd).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: '回到最新消息' })
    ).toBeOnTheScreen();
    scroll(100, 1200);
    expect(onAtEndChange.mock.calls).toEqual([[true], [false]]);
  });

  test('纯前插交给原生可见内容保持，不触发末尾跟随；never 不跟随', () => {
    const scrollToEnd = jest
      .spyOn(FlatList.prototype, 'scrollToOffset')
      .mockImplementation(() => {});
    const view = render(<MessageList {...props} />, { wrapper: ThemeProvider });
    measure();
    scroll(600);
    scrollToEnd.mockClear();
    view.rerender(<MessageList {...props} items={['earlier', ...items]} />);
    fireEvent(
      screen.getByTestId('messages-list'),
      'contentSizeChange',
      320,
      1300
    );
    expect(scrollToEnd).not.toHaveBeenCalled();
    expect(
      screen.getByTestId('messages-list').props.maintainVisibleContentPosition
    ).toEqual({ minIndexForVisible: 0 });
    view.rerender(
      <MessageList {...props} followOutput="never" items={[...items, 'd']} />
    );
    fireEvent(
      screen.getByTestId('messages-list'),
      'contentSizeChange',
      320,
      1400
    );
    expect(scrollToEnd).not.toHaveBeenCalled();
  });

  test('测量前仅保留最后一次显式滚动请求，拖动期间暂停跟随', () => {
    const scrollToEnd = jest
      .spyOn(FlatList.prototype, 'scrollToOffset')
      .mockImplementation(() => {});
    const ref = createRef<MessageListHandle>();
    render(<MessageList {...props} ref={ref} initialPosition="start" />, {
      wrapper: ThemeProvider,
    });
    act(() => {
      ref.current?.scrollToEnd({ animated: false });
      ref.current?.scrollToEnd();
    });
    expect(scrollToEnd).not.toHaveBeenCalled();
    measure();
    expect(scrollToEnd).toHaveBeenCalledTimes(1);
    expect(scrollToEnd).toHaveBeenLastCalledWith({
      offset: 600,
      animated: true,
    });
    scroll(600);
    scrollToEnd.mockClear();
    fireEvent(screen.getByTestId('messages-list'), 'scrollBeginDrag');
    fireEvent(
      screen.getByTestId('messages-list'),
      'contentSizeChange',
      320,
      1100
    );
    expect(scrollToEnd).not.toHaveBeenCalled();
  });
});

test('start 的空列表在首批数据到达后保持开头，历史 header 不跳过首条锚点', () => {
  const scrollToEnd = jest
    .spyOn(FlatList.prototype, 'scrollToOffset')
    .mockImplementation(() => {});
  const view = render(
    <MessageList
      {...props}
      items={[]}
      initialPosition="start"
      hasEarlier
      onRequestEarlier={jest.fn()}
    />,
    { wrapper: ThemeProvider }
  );
  measure(0);
  scrollToEnd.mockClear();
  view.rerender(
    <MessageList
      {...props}
      initialPosition="start"
      hasEarlier
      onRequestEarlier={jest.fn()}
    />
  );
  fireEvent(
    screen.getByTestId('messages-list'),
    'contentSizeChange',
    320,
    1000
  );
  expect(scrollToEnd).not.toHaveBeenCalled();
  const list = screen.UNSAFE_getByType(FlatList);
  expect(list.props.maintainVisibleContentPosition).toEqual({
    minIndexForVisible: 0,
  });
});

test('Web 滚轮离开末尾后不被后续内容增长拉回', () => {
  jest.replaceProperty(Platform, 'OS', 'web');
  const scrollToEnd = jest
    .spyOn(FlatList.prototype, 'scrollToOffset')
    .mockImplementation(() => {});
  const view = render(<MessageList {...props} />, { wrapper: ThemeProvider });
  measure();
  scroll(600);
  view.rerender(<MessageList {...props} extraData="外部显示更新" />);
  scroll(300);
  scrollToEnd.mockClear();
  fireEvent(
    screen.getByTestId('messages-list'),
    'contentSizeChange',
    320,
    1200
  );
  expect(scrollToEnd).not.toHaveBeenCalled();
});
