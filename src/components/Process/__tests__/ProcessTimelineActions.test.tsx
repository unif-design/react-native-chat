import {
  fireEvent,
  renderAsync,
  screen,
  within,
} from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import { ThemeProvider } from '@unif/react-native-design';
import { Process } from '@unif/react-native-chat';
import type { ProcessStep } from '@unif/react-native-chat';

const step: ProcessStep = {
  id: 'read',
  title: '读取资料',
  status: 'running',
  description: '还有 3 份',
};

test('timeline 行尾操作在说明之后，只交付允许的点击', async () => {
  const onPress = jest.fn();
  const onDisabled = jest.fn();
  const onLoading = jest.fn();
  await renderAsync(
    <Process
      variant="timeline"
      steps={[
        {
          ...step,
          actionsPlacement: 'trailing',
          actions: [
            { id: 'stop', label: '停止读取', onPress },
            {
              id: 'disabled',
              label: '暂不可用',
              disabled: true,
              onPress: onDisabled,
            },
            {
              id: 'loading',
              label: '正在核实',
              loading: true,
              onPress: onLoading,
            },
          ],
        },
      ]}
    />,
    { wrapper: ThemeProvider }
  );

  const header = screen.getByTestId('process-step-title-read').parent!.parent!;
  expect(within(header).getByText('还有 3 份')).toBeOnTheScreen();
  const stop = within(header).getByRole('button', { name: '停止读取' });
  expect(screen.getAllByRole('button', { name: '停止读取' })).toHaveLength(1);
  expect(onPress).not.toHaveBeenCalled();
  fireEvent.press(stop);
  fireEvent.press(screen.getByRole('button', { name: '暂不可用' }));
  fireEvent.press(screen.getByRole('button', { name: '正在核实' }));
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(onDisabled).not.toHaveBeenCalled();
  expect(onLoading).not.toHaveBeenCalled();
});

test.each([undefined, 'below'] as const)(
  'timeline 未请求行尾操作时保留原步骤下方位置：%s',
  async (actionsPlacement) => {
    const onPress = jest.fn();
    await renderAsync(
      <Process
        variant="timeline"
        steps={[
          {
            ...step,
            actionsPlacement,
            actions: [{ id: 'stop', label: '停止读取', onPress }],
          },
        ]}
      />,
      { wrapper: ThemeProvider }
    );
    const header = screen.getByTestId('process-step-title-read').parent!
      .parent!;
    expect(within(header).getByText('还有 3 份')).toBeOnTheScreen();
    expect(
      within(header).queryByRole('button', { name: '停止读取' })
    ).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: '停止读取' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  }
);
