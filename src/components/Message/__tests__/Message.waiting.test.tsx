import { Text } from 'react-native';
import { ThemeProvider } from '@unif/react-native-design';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { expect, test } from '@jest/globals';
import { Message, MessageWaiting, Process } from '@unif/react-native-chat';

// 缺少包根导出时，这个真实消息组合必须失败。
test('公开正文等待与过程头共存，首段正文替换三点但保留展开内容', () => {
  expect(MessageWaiting).toEqual(expect.any(Function));
  const header = (
    <Process
      variant="compact"
      steps={[
        {
          id: 'process',
          title: '公开过程',
          status: 'running',
          statusText: '准备回答',
          details: <Text>已取得的资料</Text>,
        },
      ]}
    />
  );
  const footer = <Text>独立附加说明</Text>;
  const page = render(
    <Message fullWidth status="streaming" header={header} footer={footer}>
      <MessageWaiting />
    </Message>,
    { wrapper: ThemeProvider }
  );
  expect(screen.getAllByLabelText('正在等待回复')).toHaveLength(1);
  expect(
    screen.getByLabelText('正在等待回复').props.accessibilityState
  ).toEqual({ busy: true });
  expect(
    screen.getAllByTestId(/message-waiting-dot-/, {
      includeHiddenElements: true,
    })
  ).toHaveLength(3);
  fireEvent.press(screen.getByRole('button', { name: '公开过程，准备回答' }));
  expect(screen.getByText('已取得的资料')).toBeOnTheScreen();
  expect(screen.getByText('独立附加说明')).toBeOnTheScreen();

  page.rerender(
    <Message
      fullWidth
      status="streaming"
      header={header}
      footer={footer}
      text="**首段公开正文**"
      format="markdown"
    />
  );
  expect(screen.queryByLabelText('正在等待回复')).toBeNull();
  expect(
    screen.queryByTestId('message-waiting-dot-0', {
      includeHiddenElements: true,
    })
  ).toBeNull();
  expect(screen.getByText('首段公开正文')).toBeOnTheScreen();
  expect(screen.getByText('已取得的资料')).toBeOnTheScreen();
  expect(
    screen.getByRole('button', { name: '公开过程，准备回答' }).props
      .accessibilityState.expanded
  ).toBe(true);
});

test('显式等待说明由调用方提供，撤下后不留下忙碌或状态文字', () => {
  expect(MessageWaiting).toEqual(expect.any(Function));
  const page = render(
    <Message header={<Text>保留的公开过程</Text>}>
      <MessageWaiting label="等待服务正文" />
    </Message>,
    { wrapper: ThemeProvider }
  );
  expect(screen.getByText('等待服务正文')).toBeOnTheScreen();
  expect(screen.queryByText('AI')).toBeNull();
  expect(screen.getAllByLabelText('等待服务正文')).toHaveLength(1);
  page.rerender(
    <Message
      status="failed"
      header={<Text>保留的公开过程</Text>}
      footer={<Text>服务返回的原失败说明</Text>}
    />
  );
  expect(screen.queryByLabelText('等待服务正文')).toBeNull();
  expect(screen.queryByLabelText('正在等待回复')).toBeNull();
  expect(screen.getByText('保留的公开过程')).toBeOnTheScreen();
  expect(screen.getByText('服务返回的原失败说明')).toBeOnTheScreen();
});
