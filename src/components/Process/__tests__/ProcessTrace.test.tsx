import { fireEvent, render, screen } from '@testing-library/react-native';
import { expect, test } from '@jest/globals';
import { Text } from 'react-native';
import { ThemeProvider } from '@unif/react-native-design';
import { Process } from '@unif/react-native-chat';
import type { ProcessStep } from '@unif/react-native-chat';

test('工具卡使用来源和真实状态，只有详情可展开，流更新保留用户选择', () => {
  const step: ProcessStep = {
    id: 'query',
    title: '查询客户资料',
    sourceLabel: '本机',
    status: 'running',
    statusText: '执行中',
    details: <Text>正在读取客户资料。</Text>,
  };
  const view = (value: ProcessStep) => (
    <ThemeProvider>
      <Process variant="trace" steps={[value]} />
    </ThemeProvider>
  );
  const { rerender } = render(view(step));
  expect(screen.getByText('本机')).toBeOnTheScreen();
  expect(screen.getByText('执行中')).toBeOnTheScreen();
  expect(screen.queryByText('正在读取客户资料。')).toBeNull();
  fireEvent.press(
    screen.getByRole('button', { name: '本机，查询客户资料，执行中' })
  );
  expect(screen.getByText('正在读取客户资料。')).toBeOnTheScreen();
  rerender(
    view({
      ...step,
      status: 'failed',
      statusText: '失败',
      details: <Text>客户资料读取失败。</Text>,
    })
  );
  expect(
    screen.getByRole('button', { name: '本机，查询客户资料，失败' })
  ).toHaveProp('accessibilityState', { expanded: true });
  expect(screen.getByText('客户资料读取失败。')).toBeOnTheScreen();
  rerender(
    view({
      ...step,
      status: 'completed',
      statusText: '完成',
      details: undefined,
    })
  );
  expect(screen.queryByRole('button')).toBeNull();
  expect(screen.queryByText('客户资料读取失败。')).toBeNull();
});
