import { LayoutAnimation } from 'react-native';
import { ThemeProvider } from '@unif/react-native-design';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import { Composer } from '..';
let mockReducedMotion = false;
jest.mock('@unif/react-native-design', () => {
  const original = require('@jest/globals').jest.requireActual(
    '@unif/react-native-design'
  );
  return { ...original, usePrefersReducedMotion: () => mockReducedMotion };
});

test.each([false, true])(
  '焦点布局沿用原生动画，减少动态效果=%s时保持同一输入',
  (reduced) => {
    mockReducedMotion = reduced;
    const configure = jest.spyOn(LayoutAnimation, 'configureNext');
    render(
      <Composer
        value=""
        onChangeText={jest.fn()}
        primaryAction={{ kind: 'send', onPress: jest.fn() }}
      />,
      { wrapper: ThemeProvider }
    );
    const input = screen.getByLabelText('消息输入框');
    fireEvent(input, 'focus', { nativeEvent: {} });
    fireEvent(input, 'blur', { nativeEvent: {} });
    expect(screen.getByLabelText('消息输入框')).toBe(input);
    expect(configure).toHaveBeenCalledTimes(reduced ? 0 : 2);
    configure.mockRestore();
  }
);
