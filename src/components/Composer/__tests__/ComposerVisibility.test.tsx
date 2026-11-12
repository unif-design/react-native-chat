import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import { ActivityIndicator, Animated, Platform } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { MotionScope, ThemeProvider } from '@unif/react-native-design';
import { Composer } from '..';
import { Message } from '../../Message';

beforeEach(() => {
  jest.useFakeTimers();
  jest.replaceProperty(Platform, 'OS', 'web');
  jest
    .spyOn(Animated, 'loop')
    .mockImplementation(
      jest.requireActual<{ default: Pick<typeof Animated, 'loop'> }>(
        'react-native/Libraries/Animated/AnimatedImplementation'
      ).default.loop
    );
  jest
    .spyOn(globalThis, 'requestAnimationFrame')
    .mockImplementation((callback) =>
      Number(setTimeout(() => callback(Date.now()), 16))
    );
  jest
    .spyOn(globalThis, 'cancelAnimationFrame')
    .mockImplementation((handle) => clearTimeout(handle));
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test.each(['waiting', 'listening'])(
  '%s 在隐藏范围停止帧调度，恢复保留原内容和操作',
  (kind) => {
    const stop = jest.fn();
    const cancel = jest.fn();
    const content = (active: boolean) => (
      <ThemeProvider>
        <MotionScope active={active}>
          {kind === 'waiting' ? (
            <Message status="pending" />
          ) : (
            <Composer
              testID="voice-composer"
              value="原草稿"
              onChangeText={() => {}}
              primaryAction={{ kind: 'send', onPress() {} }}
              voice={{
                status: 'listening',
                transcript: '正在听取',
                onStart() {},
                onStop: stop,
                onCancel: cancel,
              }}
            />
          )}
        </MotionScope>
      </ThemeProvider>
    );
    const page = render(content(true));
    const current = () =>
      kind === 'waiting'
        ? page.getByLabelText('正在等待回复')
        : page.getByTestId('voice-composer');
    const original = current();
    act(() => jest.advanceTimersByTime(500));
    const frames = jest.mocked(requestAnimationFrame).mock.calls.length;
    expect(frames).toBeGreaterThan(0);
    page.rerender(content(false));
    act(() => jest.advanceTimersByTime(5000));
    expect(jest.mocked(requestAnimationFrame).mock.calls).toHaveLength(frames);
    page.rerender(content(true));
    act(() => jest.advanceTimersByTime(500));
    expect(
      jest.mocked(requestAnimationFrame).mock.calls.length
    ).toBeGreaterThan(frames);
    expect(current()).toBe(original);
    expect(stop).not.toHaveBeenCalled();
    expect(cancel).not.toHaveBeenCalled();
    page.unmount();
  }
);

test('忙碌输入区只暂停加载指示，保留色彩、大小与 busy 状态', () => {
  const content = (active: boolean) => (
    <ThemeProvider>
      <MotionScope active={active}>
        <Composer
          value="原草稿"
          onChangeText={() => {}}
          primaryAction={{ kind: 'busy' }}
        />
      </MotionScope>
    </ThemeProvider>
  );
  const page = render(content(false));
  const indicator = () => page.UNSAFE_getByType(ActivityIndicator);
  const appearance = [indicator().props.color, indicator().props.size];
  expect(indicator().props.animating).toBe(false);
  expect(indicator().props.hidesWhenStopped).toBe(false);
  page.rerender(content(true));
  expect(indicator().props.animating).toBe(true);
  expect([indicator().props.color, indicator().props.size]).toEqual(appearance);
});
