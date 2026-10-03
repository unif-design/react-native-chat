import { fireEvent, render, screen } from '@testing-library/react-native';
import { expect, test } from '@jest/globals';
import App from '../App';
test('真实 Design 包在示例宿主中交付受控输入', () => {
  render(<App />);
  expect(screen.getByText('Unif Chat 开发示例')).toBeOnTheScreen();
  fireEvent.changeText(screen.getByLabelText('Design 基础输入'), '商品甲两箱');
  expect(screen.getByDisplayValue('商品甲两箱')).toBeOnTheScreen();
});

test('展厅提供真实 ProcessingProgress，并由示例控制更新和结束', () => {
  render(<App />);
  fireEvent.press(screen.getByRole('button', { name: 'ProcessingProgress' }));
  expect(
    screen.getByRole('text', { name: '正在读取资料 · 附件一' })
  ).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: '更新说明' }));
  expect(
    screen.getByRole('text', { name: '正在读取资料 · 附件二' })
  ).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: '结束展示' }));
  expect(screen.queryByRole('text', { name: /正在读取资料/ })).toBeNull();
});
