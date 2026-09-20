import { fireEvent, render, screen } from '@testing-library/react-native';
import { expect, test } from '@jest/globals';
import { ThemeProvider } from '@unif/react-native-design';
import { MainChatExample } from '../examples/MainChatExample/MainChatExample';
import { DrawerInputExample } from '../examples/DrawerInputExample/DrawerInputExample';

test('主聊天由消费者采用原文并清空草稿，建议只填入输入', () => {
  render(<MainChatExample />, { wrapper: ThemeProvider });
  fireEvent.press(screen.getByText('你好，开始验证组件'));
  expect(screen.getByDisplayValue('你好，开始验证组件')).toBeOnTheScreen();
  fireEvent.changeText(screen.getByLabelText('消息输入框'), '  原文\n第二行 ');
  fireEvent.press(screen.getByRole('button', { name: '发送' }));
  expect(screen.getByText('  原文\n第二行 ')).toBeOnTheScreen();
  expect(screen.getByLabelText('消息输入框').props.value).toBe('');
});

test('抽屉独立输入接收发送和移除事件，关闭后由消费者保留草稿', () => {
  render(<DrawerInputExample />, { wrapper: ThemeProvider });
  fireEvent.press(screen.getByRole('button', { name: '打开输入抽屉' }));
  fireEvent.changeText(screen.getByLabelText('抽屉消息输入框'), '抽屉草稿');
  fireEvent.press(screen.getByRole('button', { name: '关闭抽屉' }));
  fireEvent.press(screen.getByRole('button', { name: '打开输入抽屉' }));
  expect(screen.getByDisplayValue('抽屉草稿')).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: '发送' }));
  expect(screen.getByLabelText('抽屉消息输入框').props.value).toBe('');
  expect(
    screen.getAllByText('收到输入事件：抽屉草稿，附件 1 个').length
  ).toBeGreaterThan(0);
  fireEvent.press(screen.getByRole('button', { name: '移除样例附件' }));
  expect(screen.queryByText('样例附件')).toBeNull();
  expect(screen.queryByRole('button', { name: '发送' })).toBeNull();
});
