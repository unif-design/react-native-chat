import { StyleSheet, Text } from 'react-native';
import { ThemeProvider } from '@unif/react-native-design';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import { Message } from '..';

test.each(['start', 'end'] as const)(
  '真实失败保留%s正文且仅明确动作出现在气泡旁',
  (placement) => {
    const retry = jest.fn();
    const outer = jest.fn();
    const props = {
      placement,
      text: '保留失败正文',
      onPress: outer,
      failureAction: { id: 'retry', label: '继续原输入', onPress: retry },
    };
    const view = render(<Message {...props} status="failed" />, {
      wrapper: ThemeProvider,
    });
    const bubble = screen.getByText('保留失败正文').parent!.parent!;
    expect(StyleSheet.flatten(bubble.props.style)).toMatchObject({
      opacity: 0.7,
    });
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
  }
);

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
