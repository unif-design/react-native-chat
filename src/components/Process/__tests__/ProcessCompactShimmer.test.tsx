import { AccessibilityInfo, Animated, Text } from 'react-native';
import { act, cleanup, render } from '@testing-library/react-native';
import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import { SparkOutlined } from '@unif/react-native-icons';
import { ThemeProvider, lightColors } from '@unif/react-native-design';
import { Process } from '@unif/react-native-chat';
import type { ProcessStepStatus } from '@unif/react-native-chat';

const reanimated = jest.requireMock<typeof import('react-native-reanimated')>(
  'react-native-reanimated'
);
const realLoop = jest.requireActual<{
  default: Pick<typeof Animated, 'loop'>;
}>('react-native/Libraries/Animated/AnimatedImplementation').default.loop;

function controlledTiming() {
  return {
    start: jest.fn<Animated.CompositeAnimation['start']>(),
    stop: jest.fn(),
    reset: jest.fn(),
    _isUsingNativeDriver: () => false,
    _startNativeLoop: jest.fn(),
  };
}

let animation: ReturnType<typeof controlledTiming>;

const compactView = (status: ProcessStepStatus, statusText = '思考中') => (
  <ThemeProvider forceScheme="light">
    <Process
      variant="compact"
      identityPlacement="inline"
      identity={<Text>智能小U</Text>}
      steps={[{ id: 'reasoning', title: '智能小U', status, statusText }]}
    />
  </ThemeProvider>
);

beforeEach(() => {
  animation = controlledTiming();
  jest
    .spyOn(AccessibilityInfo, 'isReduceTransparencyEnabled')
    .mockResolvedValue(true);
  jest.spyOn(Animated, 'loop').mockImplementation(realLoop);
  jest.spyOn(Animated, 'timing').mockReturnValue(animation);
  jest.spyOn(reanimated, 'withRepeat');
  jest.spyOn(reanimated, 'useReducedMotion').mockReturnValue(false);
});

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

test.each(['completed', 'failed', 'cancelled', 'pending'] as const)(
  '运行状态仅扫描文字，转为 %s 后保持原文案并停止动画',
  (status) => {
    const page = render(compactView('running'));
    expect(animation.start).toHaveBeenCalledTimes(1);
    expect(reanimated.withRepeat).not.toHaveBeenCalled();
    expect(page.UNSAFE_getByType(SparkOutlined).props).toMatchObject({
      size: 14,
      color: lightColors.primary,
    });
    const finish = animation.start.mock.calls[0]![0]!;

    page.rerender(compactView(status));
    expect(animation.stop).toHaveBeenCalledTimes(1);
    expect(page.getByText('思考中')).toBeOnTheScreen();
    expect(page.getByText('思考中')).toHaveStyle({
      color: lightColors.foregroundMuted,
    });
    act(() => finish({ finished: true }));
    expect(animation.start).toHaveBeenCalledTimes(1);
    expect(Animated.timing).toHaveBeenCalledTimes(1);
  }
);

test('空状态文案和减少动态效果的紧凑过程保持静态', () => {
  const page = render(compactView('running', ''));
  expect(page.queryByText('思考中')).toBeNull();
  expect(Animated.timing).not.toHaveBeenCalled();
  expect(reanimated.withRepeat).not.toHaveBeenCalled();

  jest.mocked(reanimated.useReducedMotion).mockReturnValue(true);
  page.rerender(compactView('running'));
  expect(page.getByText('思考中')).toBeOnTheScreen();
  expect(Animated.timing).not.toHaveBeenCalled();
  expect(reanimated.withRepeat).not.toHaveBeenCalled();
});
