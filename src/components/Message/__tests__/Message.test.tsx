import { Image, Linking, Text } from 'react-native';
import {
  ThemeProvider,
  Button,
  type as typography,
} from '@unif/react-native-design';
import {
  act,
  fireEvent,
  render,
  screen,
  userEvent,
} from '@testing-library/react-native';
import { describe, expect, jest, test } from '@jest/globals';
import { Message } from '..';

describe('Message', () => {
  test('流式全文替换、失败保留正文，不生成身份或重试', () => {
    const view = render(<Message text="第一段" status="streaming" />, {
      wrapper: ThemeProvider,
    });
    view.rerender(
      <Message text="第一段第二段" status="failed" statusText="结果待核对" />
    );
    expect(screen.getByText('第一段第二段')).toBeOnTheScreen();
    expect(screen.getByText('结果待核对')).toBeOnTheScreen();
    expect(screen.queryByText(/重试|AI|第一段第一段/)).toBeNull();
  });

  test('只有等待且没有实际内容时展示等待指示', () => {
    const view = render(<Message text="" status="pending" />, {
      wrapper: ThemeProvider,
    });
    expect(screen.getByLabelText('正在等待回复')).toBeOnTheScreen();
    view.rerender(<Message status="pending" header={<Text>卡片</Text>} />);
    expect(screen.queryByLabelText('正在等待回复')).toBeNull();
    expect(screen.getByText('卡片')).toBeOnTheScreen();
  });

  test('内嵌操作和消息操作各自交付，忙碌动作不可用', async () => {
    const outer = jest.fn();
    const inner = jest.fn();
    const action = jest.fn();
    render(
      <Message
        onPress={outer}
        actions={[
          { id: 'copy', label: '复制', onPress: action, loading: true },
        ]}
      >
        <Button label="业务卡片" onPress={inner} />
      </Message>,
      { wrapper: ThemeProvider }
    );
    fireEvent.press(screen.getByRole('button', { name: '业务卡片' }));
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
    await userEvent.press(screen.getByRole('button', { name: '复制' }));
    expect(outer).not.toHaveBeenCalled();
    expect(action).not.toHaveBeenCalled();
  });

  test('真实 Markdown 解析表格、代码和未闭合正文，链接交回调用方', () => {
    const consoleError = jest.spyOn(console, 'error');
    const onLinkPress = jest.fn();
    const outer = jest.fn();
    const openURL = jest.spyOn(Linking, 'openURL');
    const view = render(
      <Message
        format="markdown"
        text={
          '# 标题\n\n[资料](https://example.invalid/a)\n\n|商品|数量|\n|---|---|\n|甲|2|\n\n```ts\nconst x = 1;\n```\n\n**流式'
        }
        onLinkPress={onLinkPress}
        onPress={outer}
      />,
      { wrapper: ThemeProvider }
    );
    expect(screen.getByText('标题')).toBeOnTheScreen();
    expect(screen.getByText('商品')).toBeOnTheScreen();
    expect(screen.getByText('const x = 1;')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('link', { name: '资料' }), {
      stopPropagation: jest.fn(),
    });
    expect(onLinkPress).toHaveBeenCalledWith('https://example.invalid/a');
    expect(outer).not.toHaveBeenCalled();
    expect(openURL).not.toHaveBeenCalled();
    view.rerender(
      <Message format="markdown" text="[静态资料](https://example.invalid/a)" />
    );
    expect(screen.queryByRole('link')).toBeNull();
    fireEvent.press(screen.getByText('静态资料'));
    expect(openURL).not.toHaveBeenCalled();
    openURL.mockRestore();
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  test('自有文字和 Markdown 字体都按 Design 系数缩放一次', () => {
    render(
      <ThemeProvider fontScale={1.5}>
        <Message text="普通正文" />
        <Message format="markdown" text="Markdown 正文" />
      </ThemeProvider>
    );
    expect(screen.getByText('普通正文')).toHaveStyle({
      fontSize: typography.body * 1.5,
    });
    expect(screen.getByText('Markdown 正文')).toHaveStyle({
      fontSize: typography.body * 1.5,
    });
  });
});

test('Markdown 成功图片只取一次尺寸，正文更新保留同一图片实例', async () => {
  const getSize = jest.spyOn(Image, 'getSize');
  // 外部图片边界：只回调一次，重复取尺寸不会再次返回，避免上游循环卡住测试。
  getSize.mockImplementationOnce((_uri, success) => {
    success?.(800, 400);
  });
  getSize.mockImplementation(() => {});
  const view = render(
    <Message
      format="markdown"
      text="![图片](https://example.invalid/photo.png)"
    />,
    { wrapper: ThemeProvider }
  );
  await act(async () => {});
  expect(getSize).toHaveBeenCalledTimes(1);
  view.rerender(
    <Message
      format="markdown"
      text={'![图片](https://example.invalid/photo.png)\n\n新的流式正文'}
    />
  );
  expect(getSize).toHaveBeenCalledTimes(1);
  getSize.mockRestore();
});

test('Web 合成事件从可交互子节点冒泡时不交付消息点击', () => {
  const outer = jest.fn();
  const longPress = jest.fn();
  render(<Message text="消息外壳" onPress={outer} onLongPress={longPress} />, {
    wrapper: ThemeProvider,
  });
  const action = {};
  const event = {
    target: { closest: () => action },
    currentTarget: { contains: () => true },
  };
  fireEvent.press(screen.getByText('消息外壳'), event);
  fireEvent(screen.getByText('消息外壳'), 'longPress', event);
  expect(outer).not.toHaveBeenCalled();
  expect(longPress).not.toHaveBeenCalled();
  fireEvent.press(screen.getByText('消息外壳'), {
    target: 1,
    currentTarget: 1,
  });
  expect(outer).toHaveBeenCalledTimes(1);
});
