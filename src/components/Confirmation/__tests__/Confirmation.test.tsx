import { fireEvent, render, screen } from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import { Text } from 'react-native';
import { ThemeProvider } from '@unif/react-native-design';
import { Confirmation } from '..';

const renderConfirmation = (node: React.ReactNode) =>
  render(<ThemeProvider>{node}</ThemeProvider>);

test('待确认状态只交付调用方提供的操作', () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();

  renderConfirmation(
    <Confirmation
      title="确认当前选择"
      status="pending"
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <Text>客户甲</Text>
    </Confirmation>
  );

  fireEvent.press(screen.getByRole('button', { name: '确认' }));
  fireEvent.press(screen.getByRole('button', { name: '取消' }));
  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(screen.getByText('客户甲')).toBeOnTheScreen();
});

test('禁用操作不交付事件', () => {
  const onConfirm = jest.fn();
  renderConfirmation(
    <Confirmation
      title="确认当前选择"
      status="pending"
      confirmDisabled
      onConfirm={onConfirm}
    >
      <Text>客户甲</Text>
    </Confirmation>
  );

  fireEvent.press(screen.getByRole('button', { name: '确认' }));
  expect(onConfirm).not.toHaveBeenCalled();
});

test.each([
  ['processing', '正在处理…'],
  ['confirmed', '已确认'],
  ['cancelled', '已取消'],
] as const)('%s 状态保留内容并显示默认说明', (status, statusText) => {
  renderConfirmation(
    <Confirmation title="确认当前选择" status={status}>
      <Text>客户甲</Text>
    </Confirmation>
  );

  expect(screen.getByText(statusText)).toBeOnTheScreen();
  expect(screen.getByText('客户甲')).toBeOnTheScreen();
  expect(screen.queryByRole('button')).toBeNull();
});

test('调用方可以替换状态说明并追加 footer', () => {
  renderConfirmation(
    <Confirmation
      title="确认当前选择"
      status="processing"
      statusText="等待业务系统回执"
      footer={<Text>可稍后核实</Text>}
    >
      <Text>客户甲</Text>
    </Confirmation>
  );

  expect(screen.getByText('等待业务系统回执')).toBeOnTheScreen();
  expect(screen.getByText('可稍后核实')).toBeOnTheScreen();
});
