import { useState } from 'react';
import { Animated, Pressable, Text } from 'react-native';
import {
  MotionScope,
  ThemeProvider,
  useMotionActive,
} from '@unif/react-native-design';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { afterEach, expect, jest, test } from '@jest/globals';
import { MessageList, MessageWaiting } from '../../../index';

const rows = ['a', 'b', 'c'];
const layout = (y: number, height: number) => ({
  nativeEvent: { layout: { x: 0, y, width: 320, height } },
});

function measureList() {
  const viewport = screen.getByTestId('messages-list');
  fireEvent(viewport, 'layout', layout(0, 100));
  fireEvent(viewport, 'contentSizeChange', 320, 300);
  rows.forEach((id, index) =>
    fireEvent(
      screen.getByTestId(`messages-cell-${id}`),
      'layout',
      layout(index * 100, 100)
    )
  );
  return (y: number) =>
    fireEvent.scroll(viewport, {
      nativeEvent: {
        contentOffset: { x: 0, y },
        contentSize: { width: 320, height: 300 },
        layoutMeasurement: { width: 320, height: 100 },
      },
    });
}

afterEach(() => {
  jest.restoreAllMocks();
});

test('缓存行仅在相交时开启动画，滚动保留行状态及操作', () => {
  const action = jest.fn();
  const rendered = jest.fn();
  function Row({ id }: { id: string }) {
    const active = useMotionActive();
    const [count, setCount] = useState(0);
    rendered(id);
    return (
      <Pressable
        onPress={() => {
          action(id);
          setCount(count + 1);
        }}
      >
        <Text>{`${id}/${active}/${count}`}</Text>
      </Pressable>
    );
  }
  const renderItem = jest.fn((id: string) => <Row id={id} />);
  const list = (
    <MessageList
      items={rows}
      keyExtractor={(id) => id}
      renderItem={renderItem}
      initialPosition="start"
      followOutput="never"
      testID="messages"
    />
  );
  const content = (active: boolean) => (
    <ThemeProvider>
      <MotionScope active={active}>{list}</MotionScope>
    </ThemeProvider>
  );
  const page = render(content(true));
  const scroll = measureList();
  expect(screen.getByText('a/true/0')).toBeOnTheScreen();
  expect(screen.getByText('b/false/0')).toBeOnTheScreen();
  fireEvent.press(screen.getByText('a/true/0'));
  const first = screen.getByText('a/true/1');
  renderItem.mockClear();
  rendered.mockClear();

  scroll(1);
  expect(screen.getByText('b/true/0')).toBeOnTheScreen();
  expect(rendered.mock.calls).toEqual([['b']]);
  scroll(100);
  expect(screen.getByText('a/false/1')).toBe(first);
  expect(screen.getByText('c/false/0')).toBeOnTheScreen();
  page.rerender(content(false));
  expect(screen.getByText('b/false/0')).toBeOnTheScreen();
  scroll(99);
  expect(screen.getByText('a/false/1')).toBe(first);
  page.rerender(content(true));
  expect(screen.getByText('a/true/1')).toBe(first);
  expect(screen.getByText('b/true/0')).toBeOnTheScreen();
  expect(renderItem).not.toHaveBeenCalled();
  expect(action.mock.calls).toEqual([['a']]);
});

test('已挂载的等待圆点在首个可见像素启动，离屏停止，回屏重新启动', () => {
  const start = jest.fn();
  const stop = jest.fn();
  const sequence = Animated.sequence;
  jest.spyOn(Animated, 'sequence').mockImplementation((animations) => ({
    ...sequence(animations),
    start,
    stop,
  }));
  render(
    <MessageList
      items={rows}
      keyExtractor={(id) => id}
      renderItem={(id) => (id === 'b' ? <MessageWaiting /> : <Text>{id}</Text>)}
      initialPosition="start"
      followOutput="never"
      showScrollToEnd={false}
      testID="messages"
    />,
    { wrapper: ThemeProvider }
  );
  const scroll = measureList();
  const waiting = screen.getByLabelText('正在等待回复');
  expect(start).not.toHaveBeenCalled();
  scroll(1);
  expect(start).toHaveBeenCalledTimes(3);
  scroll(200);
  expect(stop).toHaveBeenCalledTimes(3);
  scroll(199);
  expect(start).toHaveBeenCalledTimes(6);
  expect(screen.getByLabelText('正在等待回复')).toBe(waiting);
});
