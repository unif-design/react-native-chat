import { StyleSheet, Text, View } from 'react-native';
import { GlassLayer, ThemeProvider } from '@unif/react-native-design';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import { Message } from '..';
import { Attachments } from '../../Attachments';
import { Confirmation } from '../../Confirmation';

test.each(['start', 'end'] as const)(
  '真实失败保留%s正文且仅明确动作出现在气泡旁',
  (placement) => {
    const retry = jest.fn();
    const outer = jest.fn();
    const props = {
      placement,
      text: '保留失败正文',
      statusText: '发送失败',
      onPress: outer,
      failureAction: { id: 'retry', label: '继续原输入', onPress: retry },
    };
    const view = render(<Message {...props} status="failed" />, {
      wrapper: ThemeProvider,
    });
    const bubble = screen.getByText('保留失败正文').parent!.parent!;
    expect(StyleSheet.flatten(bubble.props.style).opacity).toBeUndefined();
    expect(screen.getByText('保留失败正文')).toHaveStyle({ opacity: 0.7 });
    expect(screen.getByText('发送失败')).toHaveStyle({ opacity: 0.7 });
    expect(StyleSheet.flatten(bubble.props.style).borderColor).toBeUndefined();
    const action = screen.getByRole('button', { name: '继续原输入' });
    fireEvent.press(action);
    expect(retry).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
    view.rerender(
      <Message
        {...props}
        status="failed"
        failureAction={{ ...props.failureAction, disabled: true }}
      />
    );
    expect(screen.getByRole('button', { name: '继续原输入' })).toBeDisabled();
    fireEvent.press(screen.getByRole('button', { name: '继续原输入' }));
    expect(retry).toHaveBeenCalledTimes(1);
    view.rerender(<Message {...props} status="idle" />);
    expect(screen.queryByRole('button', { name: '继续原输入' })).toBeNull();
    expect(
      StyleSheet.flatten(
        screen.getByText('保留失败正文').parent!.parent!.props.style
      ).opacity
    ).toBeUndefined();
    expect(
      StyleSheet.flatten(screen.getByText('保留失败正文').props.style).opacity
    ).toBeUndefined();
  }
);

test.each(['children', 'header', 'footer'] as const)(
  '失败消息的 %s 保留真实玻璃控件层级与各自操作',
  (slot) => {
    const onRemove = jest.fn();
    const onCancel = jest.fn();
    const outer = jest.fn();
    const item = { id: 'photo', name: '图片', removable: true };
    const content = (
      <View>
        <Attachments items={[item]} onRemove={onRemove} />
        <Confirmation title="当前确认" status="pending" onCancel={onCancel}>
          <Text>调用方内容</Text>
        </Confirmation>
      </View>
    );
    const props = { [slot]: content };
    const view = render(
      <Message {...props} status="failed" onPress={outer} testID="message" />,
      { wrapper: ThemeProvider }
    );
    const material = screen.UNSAFE_getAllByType(GlassLayer)[0]!;
    for (const layer of screen.UNSAFE_getAllByType(GlassLayer)) {
      let ancestor = layer.parent;
      while (ancestor) {
        expect(StyleSheet.flatten(ancestor.props.style)?.opacity ?? 1).toBe(1);
        if (ancestor.props.testID === 'message') break;
        ancestor = ancestor.parent;
      }
    }
    fireEvent.press(screen.getByRole('button', { name: '移除图片' }));
    expect(onRemove).toHaveBeenCalledWith(item);
    fireEvent.press(screen.getByRole('button', { name: '取消' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
    view.rerender(
      <Message {...props} status="idle" onPress={outer} testID="message" />
    );
    expect(screen.UNSAFE_getAllByType(GlassLayer)[0]).toBe(material);
  }
);

test('失败只淡化自有 Markdown 分支，保留正文和链接交付', () => {
  const onLinkPress = jest.fn();
  const view = render(
    <Message
      status="failed"
      format="markdown"
      text="[资料](https://example.invalid/a)"
      header={<Text testID="header">外部内容</Text>}
      onLinkPress={onLinkPress}
    />,
    { wrapper: ThemeProvider }
  );
  let ancestor = screen.getByRole('link', { name: '资料' }).parent;
  let dimmed = 0;
  while (ancestor) {
    if (
      typeof ancestor.type === 'string' &&
      StyleSheet.flatten(ancestor.props.style)?.opacity === 0.7
    )
      dimmed++;
    ancestor = ancestor.parent;
  }
  expect(dimmed).toBe(1);
  expect(
    StyleSheet.flatten(screen.getByTestId('header').parent!.parent!.props.style)
      ?.opacity
  ).toBeUndefined();
  fireEvent.press(screen.getByRole('link', { name: '资料' }), {
    stopPropagation: jest.fn(),
  });
  expect(onLinkPress).toHaveBeenCalledWith('https://example.invalid/a');
  view.rerender(<Message format="markdown" text="恢复正文" />);
  expect(screen.getByText('恢复正文')).toBeOnTheScreen();
  ancestor = screen.getByText('恢复正文').parent;
  while (ancestor) {
    expect(StyleSheet.flatten(ancestor.props.style)?.opacity ?? 1).toBe(1);
    ancestor = ancestor.parent;
  }
});

test('等待使用三点及调用方真实状态；正文或卡片到达即撤下装饰，不造身份', () => {
  const view = render(<Message status="pending" statusText="正在提交输入" />, {
    wrapper: ThemeProvider,
  });
  expect(
    screen.getByLabelText('正在提交输入').props.accessibilityState
  ).toEqual({ busy: true });
  expect(
    screen.getAllByTestId(/message-waiting-dot-/, {
      includeHiddenElements: true,
    })
  ).toHaveLength(3);
  expect(screen.getByText('正在提交输入')).toBeOnTheScreen();
  expect(screen.queryByText('AI')).toBeNull();
  view.rerender(<Message status="streaming" text="已经收到正文" />);
  expect(
    screen.queryByTestId('message-waiting-dot-0', {
      includeHiddenElements: true,
    })
  ).toBeNull();
  expect(screen.getByText('已经收到正文')).toBeOnTheScreen();
  view.rerender(
    <Message status="pending">
      <Text>实际卡片</Text>
    </Message>
  );
  expect(screen.queryByLabelText('正在等待回复')).toBeNull();
});
