import { Text } from 'react-native';
import { ThemeProvider } from '@unif/react-native-design';
import { render, screen } from '@testing-library/react-native';
import { expect, test } from '@jest/globals';
import { Chat } from '..';

test('Chat 内容按顺序布局，底部留白只属于根容器', () => {
  render(
    <Chat
      testID="chat"
      header={<Text>顶部</Text>}
      composer={<Text>输入</Text>}
      footer={<Text>底部</Text>}
      bottomInset={20}
    >
      <Text>消息</Text>
    </Chat>,
    { wrapper: ThemeProvider }
  );
  expect(
    screen
      .getAllByText(/顶部|消息|输入|底部/)
      .map((node) => node.props.children)
  ).toEqual(['顶部', '消息', '输入', '底部']);
  expect(screen.getByTestId('chat')).toHaveStyle({ paddingBottom: 20 });
});

test.each([Number.NaN, Infinity, -20])(
  '非法或负底部留白 %s 不向布局传播',
  (bottomInset) => {
    render(
      <Chat testID="chat" bottomInset={bottomInset}>
        {null}
      </Chat>,
      { wrapper: ThemeProvider }
    );
    expect(screen.getByTestId('chat')).toHaveStyle({ paddingBottom: 0 });
  }
);
