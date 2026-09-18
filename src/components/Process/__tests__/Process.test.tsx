import { fireEvent, render, screen } from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import { Text } from 'react-native';
import { ThemeProvider } from '@unif/react-native-design';
import { Process } from '..';
import type { ProcessStep } from '..';

const renderProcess = (node: React.ReactNode) =>
  render(<ThemeProvider>{node}</ThemeProvider>);

const completedStep: ProcessStep = {
  id: 'done',
  title: '整理结果',
  status: 'completed',
  description: '已整理公开字段',
  elapsedMs: 1250,
  details: <Text>公开过程详情</Text>,
};

const steps: readonly ProcessStep[] = [
  { id: 'waiting', title: '等待材料', status: 'pending' },
  { id: 'reading', title: '读取附件', status: 'running' },
  completedStep,
  { id: 'failed', title: '查询资料', status: 'failed' },
  { id: 'cancelled', title: '生成草稿', status: 'cancelled' },
];

test('按输入顺序展示全部状态、说明与外部时长', () => {
  renderProcess(<Process title="处理进度" steps={steps} />);

  const titles = screen.getAllByTestId(/process-step-title-/);
  expect(titles.map((node) => node.props.children)).toEqual([
    '等待材料',
    '读取附件',
    '整理结果',
    '查询资料',
    '生成草稿',
  ]);
  expect(screen.getByText('待处理')).toBeOnTheScreen();
  expect(screen.getByText('处理中')).toBeOnTheScreen();
  expect(screen.getByText('已完成')).toBeOnTheScreen();
  expect(screen.getByText('失败')).toBeOnTheScreen();
  expect(screen.getByText('已取消')).toBeOnTheScreen();
  expect(screen.getByText('已整理公开字段')).toBeOnTheScreen();
  expect(screen.getByText('1.3 秒')).toBeOnTheScreen();
});

test('时长进位后不会显示六十秒余数', () => {
  renderProcess(
    <Process
      steps={[
        {
          id: 'waiting-result',
          title: '等待回执',
          status: 'running',
          elapsedMs: 119999,
        },
      ]}
    />
  );

  expect(screen.getByText('2 分钟')).toBeOnTheScreen();
  expect(screen.queryByText(/60 秒/)).toBeNull();
});

test('局部展开只初始化一次，交付变化并在项目移除后收尾', () => {
  const onExpandedChange = jest.fn();
  const { rerender } = renderProcess(
    <Process
      steps={[completedStep]}
      defaultExpandedIds={['done']}
      onExpandedChange={onExpandedChange}
    />
  );

  expect(screen.getByText('公开过程详情')).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId('process-step-done-toggle'));
  expect(screen.queryByText('公开过程详情')).toBeNull();
  expect(onExpandedChange).toHaveBeenLastCalledWith([]);

  rerender(
    <ThemeProvider>
      <Process
        steps={[]}
        defaultExpandedIds={['done']}
        onExpandedChange={onExpandedChange}
      />
    </ThemeProvider>
  );
  rerender(
    <ThemeProvider>
      <Process
        steps={[completedStep]}
        defaultExpandedIds={['done']}
        onExpandedChange={onExpandedChange}
      />
    </ThemeProvider>
  );
  expect(screen.queryByText('公开过程详情')).toBeNull();
});

test('受控展开只交付新集合并等待 props 更新', () => {
  const onExpandedChange = jest.fn();
  const { rerender } = renderProcess(
    <Process
      steps={[completedStep]}
      expandedIds={[]}
      onExpandedChange={onExpandedChange}
    />
  );

  fireEvent.press(screen.getByTestId('process-step-done-toggle'));
  expect(onExpandedChange).toHaveBeenCalledWith(['done']);
  expect(screen.queryByText('公开过程详情')).toBeNull();

  rerender(
    <ThemeProvider>
      <Process
        steps={[completedStep]}
        expandedIds={['done']}
        onExpandedChange={onExpandedChange}
      />
    </ThemeProvider>
  );
  expect(screen.getByText('公开过程详情')).toBeOnTheScreen();
});

test('过程操作只在用户点击时交付，忙碌操作不重复交付', () => {
  const onRetry = jest.fn();
  const onBusy = jest.fn();
  renderProcess(
    <Process
      steps={[
        {
          id: 'failed',
          title: '查询资料',
          status: 'failed',
          actions: [
            { id: 'retry', label: '重新查询', onPress: onRetry },
            {
              id: 'busy',
              label: '正在核实',
              loading: true,
              onPress: onBusy,
            },
          ],
        },
      ]}
    />
  );

  expect(onRetry).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: '重新查询' }));
  fireEvent.press(screen.getByRole('button', { name: '正在核实' }));
  expect(onRetry).toHaveBeenCalledTimes(1);
  expect(onBusy).not.toHaveBeenCalled();
});
