import { fireEvent, render, screen } from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import { Text } from 'react-native';
import { ThemeProvider } from '@unif/react-native-design';
import { Citation } from '..';

const renderCitation = (node: React.ReactNode) =>
  render(<ThemeProvider>{node}</ThemeProvider>);

test('引用标记保持 Text 根节点并使用默认可访问名称', () => {
  renderCitation(
    <Text>
      相关资料
      <Citation label="1" testID="citation" />
    </Text>
  );

  expect(screen.getByTestId('citation').type).toBe('Text');
  expect(screen.getByLabelText('引用1')).toHaveTextContent('[1]');
});

test('点击仅交付明确绑定的来源操作', () => {
  const onPress = jest.fn();
  const stopPropagation = jest.fn();
  renderCitation(
    <Citation label="2" accessibilityLabel="打开来源 2" onPress={onPress} />
  );

  fireEvent.press(screen.getByLabelText('打开来源 2'), { stopPropagation });
  expect(stopPropagation).toHaveBeenCalledTimes(1);
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('禁用引用保持静态且不交付点击', () => {
  const onPress = jest.fn();
  renderCitation(<Citation label="3" disabled onPress={onPress} />);

  const citation = screen.getByLabelText('引用3');
  expect(citation.props.onPress).toBeUndefined();
  expect(onPress).not.toHaveBeenCalled();
  expect(citation.props.accessibilityState).toMatchObject({
    disabled: true,
  });
});
