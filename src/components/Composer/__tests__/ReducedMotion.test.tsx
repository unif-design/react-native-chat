import { Animated, Platform } from 'react-native';
import { ThemeProvider } from '@unif/react-native-design';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { afterEach, expect, jest, test } from '@jest/globals';
import { ComposerVoiceWave } from '../ComposerVoiceWave';
import { MessageWaiting } from '../../Message/MessageWaiting';
import { MessageListEndButton } from '../../MessageList/MessageListEndButton';

let mockReducedMotion = true;
jest.mock('@unif/react-native-design', () => ({
  ...require('@jest/globals').jest.requireActual('@unif/react-native-design'),
  usePrefersReducedMotion: () => mockReducedMotion,
}));
afterEach(() => {
  jest.restoreAllMocks();
});

test('减少动态效果时波形与等待点静止，卸载仍释放已构造的动画', () => {
  mockReducedMotion = true;
  jest.replaceProperty(Platform, 'OS', 'web');
  const start = jest.fn();
  const stop = jest.fn();
  jest
    .spyOn(Animated, 'sequence')
    .mockReturnValue({ start, stop, reset: jest.fn() });
  const view = render(
    <>
      <ComposerVoiceWave />
      <MessageWaiting label="等待正文" />
    </>,
    { wrapper: ThemeProvider }
  );
  expect(screen.getByLabelText('等待正文').props.accessibilityState).toEqual({
    busy: true,
  });
  expect(start).not.toHaveBeenCalled();
  view.unmount();
  expect(stop).toHaveBeenCalled();
});

test('减少动态效果时返回末尾按钮立即出现并继续交付点击', () => {
  mockReducedMotion = true;
  const spring = jest.spyOn(Animated, 'spring');
  const onPress = jest.fn();
  render(
    <MessageListEndButton busy={false} bottomInset={12} onPress={onPress} />,
    { wrapper: ThemeProvider }
  );
  expect(
    screen.getByRole('button', { name: '回到最新消息' })
  ).toBeOnTheScreen();
  expect(spring).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: '回到最新消息' }));
  expect(onPress).toHaveBeenCalledTimes(1);
});
