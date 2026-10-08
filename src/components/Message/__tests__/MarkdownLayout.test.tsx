import { ScrollView, StyleSheet, Text } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import { ThemeProvider, space } from '@unif/react-native-design';
import { Message } from '@unif/react-native-chat';
import { render, screen } from '@testing-library/react-native';
import { afterEach, expect, jest, test } from '@jest/globals';

function nativeViewParent(element: ReactTestInstance) {
  let parent = element.parent;
  while (
    parent &&
    (typeof parent.type !== 'string' || String(parent.type) !== 'View')
  )
    parent = parent.parent;
  if (!parent) throw new Error('Expected a native parent');
  return parent;
}

afterEach(() => {
  jest.restoreAllMocks();
});

test.each(['bubble', 'outlined', 'plain'] as const)(
  '%s 消息的 Markdown 顶层块共享正文容器，不继承附加区域的间距',
  (surface) => {
    render(
      <Message
        surface={surface}
        fullWidth
        header={<Text>公开过程</Text>}
        footer={<Text>附加说明</Text>}
        format="markdown"
        text={'第一段正文\n\n第二段正文'}
      />,
      { wrapper: ThemeProvider }
    );
    const content = nativeViewParent(screen.getByText('公开过程'));
    const firstParagraph = nativeViewParent(screen.getByText('第一段正文'));
    const secondParagraph = nativeViewParent(screen.getByText('第二段正文'));
    const body = nativeViewParent(firstParagraph);

    expect(body === content).toBe(false);
    expect(nativeViewParent(secondParagraph) === body).toBe(true);
    expect(nativeViewParent(body) === content).toBe(true);
    expect(nativeViewParent(screen.getByText('附加说明')) === content).toBe(
      true
    );
    expect(StyleSheet.flatten(content.props.style).gap).toBe(space[2]);
    expect(StyleSheet.flatten(body.props.style)?.gap).toBeUndefined();
    expect(screen.UNSAFE_queryAllByType(ScrollView)).toHaveLength(0);
  }
);

test('空 Markdown 等待不产生额外正文占位，首段到达后撤下三点', () => {
  const page = render(<Message status="pending" />, {
    wrapper: ThemeProvider,
  });
  const emptyWaiting = page.toJSON();
  page.rerender(<Message format="markdown" text="" status="pending" />);

  expect(screen.getAllByLabelText('正在等待回复')).toHaveLength(1);
  expect(page.toJSON()).toEqual(emptyWaiting);
  page.rerender(
    <Message format="markdown" text="首段已到达" status="streaming" />
  );
  expect(screen.getByText('首段已到达')).toBeOnTheScreen();
  expect(screen.queryByLabelText('正在等待回复')).toBeNull();
});

test('状态刷新复用 Markdown 解析，累计正文变化仍更新所有块', () => {
  const parser = jest.requireActual<typeof import('marked')>('marked');
  const lexer = jest.spyOn(parser, 'lexer');
  const text = '已有第一段\n\n已有第二段';
  const page = render(
    <Message format="markdown" text={text} status="streaming" />,
    { wrapper: ThemeProvider }
  );
  const parsed = () =>
    lexer.mock.calls.filter(([source]) => source === text).length;
  const initialParses = parsed();
  expect(initialParses).toBeGreaterThan(0);

  page.rerender(<Message format="markdown" text={text} status="idle" />);
  expect(parsed()).toBe(initialParses);
  page.rerender(<Message format="markdown" text={`${text}\n\n追加第三段`} />);
  expect(screen.getByText('已有第一段')).toBeOnTheScreen();
  expect(screen.getByText('已有第二段')).toBeOnTheScreen();
  expect(screen.getByText('追加第三段')).toBeOnTheScreen();
});
