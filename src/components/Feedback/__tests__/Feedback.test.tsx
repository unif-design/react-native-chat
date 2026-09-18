import { fireEvent, render, screen } from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import { ThemeProvider } from '@unif/react-native-design';
import { Feedback } from '..';

const renderFeedback = (node: React.ReactNode) =>
  render(<ThemeProvider>{node}</ThemeProvider>);

test.each([
  ['info', '信息'],
  ['success', '成功'],
  ['warning', '警告'],
  ['error', '错误'],
] as const)('%s 语义提供对应可访问说明', (tone, toneLabel) => {
  renderFeedback(<Feedback tone={tone} message="当前结果说明" />);
  expect(screen.getByLabelText(`${toneLabel}：当前结果说明`)).toBeOnTheScreen();
});

test('省略 tone 时使用信息语义，标题缺失不占位', () => {
  renderFeedback(<Feedback message="尚未取得最终结果" />);
  expect(screen.getByLabelText('信息：尚未取得最终结果')).toBeOnTheScreen();
  expect(screen.queryByTestId('feedback-title')).toBeNull();
});

test('操作沿用原操作状态且只在点击时交付', () => {
  const onPress = jest.fn();
  renderFeedback(
    <Feedback
      title="请求未确认"
      message="可核实原请求"
      action={{
        id: 'verify',
        label: '核实结果',
        accessibilityHint: '查询原请求状态',
        onPress,
      }}
    />
  );

  expect(onPress).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: '核实结果' }));
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(screen.getByText('请求未确认')).toBeOnTheScreen();
});

test('忙碌操作不交付点击', () => {
  const onPress = jest.fn();
  renderFeedback(
    <Feedback
      message="正在核实"
      action={{
        id: 'verify',
        label: '核实结果',
        loading: true,
        onPress,
      }}
    />
  );

  fireEvent.press(screen.getByRole('button', { name: '核实结果' }));
  expect(onPress).not.toHaveBeenCalled();
});
