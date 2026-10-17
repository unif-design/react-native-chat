import {
  fireEvent,
  render,
  screen,
  userEvent,
} from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import { ThemeProvider } from '@unif/react-native-design';
import { Sources } from '..';
import type { SourceItem } from '..';

const renderSources = (node: React.ReactNode) =>
  render(<ThemeProvider>{node}</ThemeProvider>);

test('空集合整体不占位', () => {
  renderSources(<Sources items={[]} testID="sources" />);
  expect(screen.queryByTestId('sources')).toBeNull();
});

test('按输入顺序展示缺省标题项与重复标题', () => {
  renderSources(
    <Sources
      items={[
        { id: 'a', label: '1', title: '客户资料' },
        { id: 'b', label: '2' },
        { id: 'c', label: '3', title: '客户资料' },
      ]}
    />
  );

  expect(screen.getByText('参考来源')).toBeOnTheScreen();
  expect(
    screen.getAllByTestId(/source-label-/).map((node) => node.props.children)
  ).toEqual(['1', '2', '3']);
  expect(screen.getAllByText('客户资料')).toHaveLength(2);
});

test('可点击项交付原项，禁用项不交付事件', () => {
  const active: SourceItem = {
    id: 'active',
    label: '1',
    title: '当前客户资料',
  };
  const disabled: SourceItem = {
    id: 'disabled',
    label: '2',
    title: '历史资料',
    disabled: true,
  };
  const onPress = jest.fn();
  renderSources(<Sources items={[active, disabled]} onPress={onPress} />);

  fireEvent.press(screen.getByTestId('source-active'));
  fireEvent.press(screen.getByTestId('source-disabled'));
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(onPress).toHaveBeenCalledWith(active);
  expect(
    screen.getByTestId('source-disabled').props.accessibilityState
  ).toMatchObject({
    disabled: true,
  });
});

test('没有回调时静态显示', () => {
  renderSources(
    <Sources items={[{ id: 'static', label: '1', title: '资料' }]} />
  );
  expect(screen.queryByRole('button')).toBeNull();
});

test('来源描述与缺省标题的可访问名称，按压态不改变原项事件', async () => {
  const item = { id: 'details', label: '3', description: '原始来源描述' };
  const onPress = jest.fn();
  const view = renderSources(
    <Sources title="引用" items={[item]} onPress={onPress} />
  );
  const row = screen.getByRole('button', { name: '3' });
  expect(screen.getByText('原始来源描述')).toBeOnTheScreen();
  await userEvent.press(row);
  expect(onPress).toHaveBeenCalledWith(item);
  view.rerender(
    <ThemeProvider>
      <Sources items={[{ ...item, disabled: true }]} />
    </ThemeProvider>
  );
  expect(screen.queryByRole('button')).toBeNull();
  expect(screen.getByText('原始来源描述')).toBeOnTheScreen();
});
