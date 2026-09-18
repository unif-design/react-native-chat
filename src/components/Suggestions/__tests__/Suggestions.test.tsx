import { fireEvent, render, screen } from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import { ThemeProvider } from '@unif/react-native-design';
import { Suggestions } from '..';
import type { SuggestionItem } from '..';

const renderSuggestions = (node: React.ReactNode) =>
  render(<ThemeProvider>{node}</ThemeProvider>);

test('空集合不占位', () => {
  renderSuggestions(<Suggestions items={[]} testID="suggestions" />);
  expect(screen.queryByTestId('suggestions')).toBeNull();
});

test('重复文案按原项身份交付，忙碌和禁用项不交付事件', () => {
  const first: SuggestionItem = { id: 'first', label: '查询客户' };
  const second: SuggestionItem = {
    id: 'second',
    label: '查询客户',
    selected: true,
  };
  const busy: SuggestionItem = {
    id: 'busy',
    label: '处理中',
    loading: true,
  };
  const disabled: SuggestionItem = {
    id: 'disabled',
    label: '不可用',
    disabled: true,
  };
  const onSelect = jest.fn();

  renderSuggestions(
    <Suggestions items={[first, second, busy, disabled]} onSelect={onSelect} />
  );

  const selectedSuggestion = screen.getByRole('button', {
    name: '查询客户',
    selected: true,
  });
  fireEvent.press(selectedSuggestion);
  expect(onSelect).toHaveBeenCalledWith(second);
  expect(selectedSuggestion.props.accessibilityState).toMatchObject({
    selected: true,
  });

  fireEvent.press(screen.getByLabelText('处理中'));
  fireEvent.press(screen.getByLabelText('不可用'));
  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(
    screen.getByLabelText('处理中').props.accessibilityState
  ).toMatchObject({
    busy: true,
    disabled: true,
  });
});

test('没有选择回调时静态显示', () => {
  renderSuggestions(
    <Suggestions items={[{ id: 'static', label: '仅展示' }]} />
  );
  expect(screen.getByText('仅展示')).toBeOnTheScreen();
  expect(screen.queryByRole('button')).toBeNull();
});
