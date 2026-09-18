import { fireEvent, render, screen } from '@testing-library/react-native';
import { expect, test } from '@jest/globals';
import App from '../App';
test('真实 Design 包在示例宿主中交付受控输入', () => {
  render(<App />);
  expect(screen.getByText('Unif Chat 开发示例')).toBeOnTheScreen();
  fireEvent.changeText(screen.getByLabelText('Design 基础输入'), '商品甲两箱');
  expect(screen.getByDisplayValue('商品甲两箱')).toBeOnTheScreen();
});
