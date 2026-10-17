import { Text } from 'react-native';
import {
  fireEvent,
  render,
  screen,
  userEvent,
} from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import { ThemeProvider } from '@unif/react-native-design';
import { Process } from '..';
import { ProcessCompactStep } from '../ProcessCompactStep';

test.each([
  [200, '200 毫秒'],
  [1200, '1.2 秒'],
  [2000, '2 秒'],
  [60000, '1 分钟'],
  [61000, '1 分 1 秒'],
] as const)('公开耗时 %s 按单位展示', (elapsedMs, label) => {
  render(
    <Process
      steps={[
        { id: 'time', title: '公开步骤', status: 'completed', elapsedMs },
      ]}
    />,
    { wrapper: ThemeProvider }
  );
  expect(screen.getByText(label)).toBeOnTheScreen();
});

test.each([NaN, Infinity, -1])('非法耗时 %s 不创建时间说明', (elapsedMs) => {
  render(
    <Process
      steps={[
        { id: 'time', title: '公开步骤', status: 'completed', elapsedMs },
      ]}
    />,
    { wrapper: ThemeProvider }
  );
  expect(screen.queryByText(/秒|分钟/)).toBeNull();
});

test.each(['timeline', 'trace'] as const)(
  '%s 展示全部终态、可选详情并交付允许的动作',
  (variant) => {
    const onPress = jest.fn();
    render(
      <Process
        variant={variant}
        steps={[
          {
            id: 'running',
            title: '执行',
            status: 'running',
            description: '执行说明',
            elapsedMs: 1000,
            details: <Text>执行详情</Text>,
            actions: [{ id: 'next', label: '继续', onPress }],
          },
          {
            id: 'failed',
            title: '失败',
            status: 'failed',
            description: '失败说明',
            statusText: '',
            icon: null,
            details: <Text>失败详情</Text>,
          },
          { id: 'pending', title: '等待', status: 'pending', actions: [] },
          { id: 'cancelled', title: '取消', status: 'cancelled' },
          {
            id: 'done',
            title: '完成',
            status: 'completed',
            statusText: '',
            elapsedMs: 3000,
          },
        ]}
      />,
      { wrapper: ThemeProvider }
    );
    expect(screen.getByText('执行说明')).toBeOnTheScreen();
    expect(screen.getByText('失败说明')).toBeOnTheScreen();
    expect(screen.queryByText('执行详情')).toBeNull();
    fireEvent.press(screen.getByTestId('process-step-running-toggle'));
    expect(screen.getByText('执行详情')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('process-step-running-toggle'));
    expect(screen.queryByText('执行详情')).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: '继续' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  }
);

test('行内身份与标题分别展示，缺省密度的步骤保持按压与展开事件', async () => {
  const view = render(
    <Process
      title="过程标题"
      identity={<Text>执行者</Text>}
      identityPlacement="inline"
      variant="compact"
      steps={[{ id: 'one', title: '步骤', status: 'completed' }]}
    />,
    { wrapper: ThemeProvider }
  );
  expect(screen.getByText('过程标题')).toBeOnTheScreen();
  expect(screen.getByText('执行者')).toBeOnTheScreen();
  view.rerender(<Process identity={<Text>另一个执行者</Text>} steps={[]} />);
  expect(screen.getByText('另一个执行者')).toBeOnTheScreen();
  const onToggle = jest.fn();
  view.rerender(
    <ProcessCompactStep
      step={{
        id: 'one',
        title: '步骤',
        status: 'pending',
        details: <Text>详情</Text>,
      }}
      expanded={false}
      onToggle={onToggle}
    />
  );
  const toggle = screen.getByTestId('process-step-one-toggle');
  await userEvent.press(toggle);
  expect(onToggle).toHaveBeenCalledTimes(1);
});
