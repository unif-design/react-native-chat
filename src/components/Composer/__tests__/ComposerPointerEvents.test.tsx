import { Platform, StyleSheet } from 'react-native';
import type { PressableProps } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { afterEach, expect, jest, test } from '@jest/globals';
import { ThemeProvider } from '@unif/react-native-design';
import { Composer } from '..';
import { ComposerIconAction } from '../ComposerIconAction';

afterEach(() => {
  jest.restoreAllMocks();
});

function iconBackground() {
  const button = screen.getByRole('button', { name: '更多操作' });
  const visual = button.findAll(
    (node) => node.props.pointerEvents === 'none'
  )[0]!;
  return StyleSheet.flatten(visual.props.style).backgroundColor;
}

test.each([
  ['web', 'mouse', 0, true],
  ['web', 'mouse', 2, false],
  ['web', 'touch', 0, false],
  ['web', 'pen', 0, false],
  ['ios', 'mouse', 0, false],
  ['android', 'mouse', 0, false],
] as const)(
  '%s %s button=%s 仅 Web 鼠标主键阻止默认聚焦',
  (platform, pointerType, button, expected) => {
    jest.replaceProperty(Platform, 'OS', platform);
    const onPress = jest.fn();
    const preventDefault = jest.fn();
    render(
      <ComposerIconAction icon="plus" label="更多操作" onPress={onPress} />,
      { wrapper: ThemeProvider }
    );
    const action = screen.getByRole('button', { name: '更多操作' });
    fireEvent(action, 'pointerDown', {
      nativeEvent: { pointerType, button },
      preventDefault,
    });
    expect(preventDefault).toHaveBeenCalledTimes(expected ? 1 : 0);
    if (expected) expect(iconBackground()).toBeDefined();
    else expect(iconBackground()).toBeUndefined();
    if (platform !== 'web') expect(action.props.onPointerDown).toBeUndefined();
    expect(onPress).not.toHaveBeenCalled();
  }
);

test.each(['pointerUp', 'pointerCancel', 'pointerLeave'])(
  '%s 清理 Web 鼠标图标按压反馈且不交付点击',
  (eventName) => {
    jest.replaceProperty(Platform, 'OS', 'web');
    const onPress = jest.fn();
    render(
      <ComposerIconAction icon="plus" label="更多操作" onPress={onPress} />,
      { wrapper: ThemeProvider }
    );
    const action = screen.getByRole('button', { name: '更多操作' });
    fireEvent(action, 'pointerDown', {
      nativeEvent: { pointerType: 'mouse', button: 0 },
      preventDefault: jest.fn(),
    });
    expect(iconBackground()).toBeDefined();
    fireEvent(action, eventName, {
      nativeEvent: { pointerType: 'mouse', button: 0 },
    });
    expect(iconBackground()).toBeUndefined();
    expect(onPress).not.toHaveBeenCalled();
  }
);

test('禁用及恢复不留下鼠标按压反馈', () => {
  jest.replaceProperty(Platform, 'OS', 'web');
  const props = {
    icon: 'plus' as const,
    label: '更多操作',
    onPress: jest.fn(),
  };
  const view = render(<ComposerIconAction {...props} />, {
    wrapper: ThemeProvider,
  });
  fireEvent(screen.getByRole('button', { name: '更多操作' }), 'pointerDown', {
    nativeEvent: { pointerType: 'mouse', button: 0 },
    preventDefault: jest.fn(),
  });
  expect(iconBackground()).toBeDefined();
  view.rerender(<ComposerIconAction {...props} disabled />);
  expect(iconBackground()).toBeUndefined();
  view.rerender(<ComposerIconAction {...props} />);
  expect(iconBackground()).toBeUndefined();
});

test('菜单行的鼠标按压底色在松开后恢复，菜单操作仍可交付', () => {
  jest.replaceProperty(Platform, 'OS', 'web');
  const onSelect = jest.fn();
  render(
    <Composer
      value=""
      onChangeText={jest.fn()}
      primaryAction={{ kind: 'send', onPress: jest.fn() }}
      actions={[
        { id: 'photo', label: '选择照片', icon: 'image', onPress: onSelect },
      ]}
    />,
    { wrapper: ThemeProvider }
  );
  fireEvent.press(screen.getByRole('button', { name: '更多操作' }));
  const item = screen.getByRole('button', { name: '选择照片' });
  fireEvent(item, 'pointerDown', {
    nativeEvent: { pointerType: 'mouse', button: 0 },
    preventDefault: jest.fn(),
  });
  expect(StyleSheet.flatten(item.props.style).backgroundColor).toBeDefined();
  fireEvent(item, 'pointerUp', {
    nativeEvent: { pointerType: 'mouse', button: 0 },
  });
  expect(StyleSheet.flatten(item.props.style).backgroundColor).toBeUndefined();
  fireEvent.press(item);
  expect(onSelect).toHaveBeenCalledTimes(1);
});

interface WebResponder {
  reset(): void;
  getEventHandlers(): {
    onClick(event: object): void;
    onKeyDown(event: object): void;
  };
}

function webResponder(label: string) {
  // 验证已安装 RNW 的真实 click/key 路径；生产代码不依赖这个内部模块。
  const InstalledWebPressResponder = jest.requireActual<
    new (options: Pick<PressableProps, 'onPress' | 'disabled'>) => WebResponder
  >('react-native-web/dist/cjs/modules/usePressEvents/PressResponder');
  let action = screen.getByRole('button', { name: label });
  while (action.parent && typeof action.props.onPress !== 'function') {
    action = action.parent;
  }
  expect(typeof action.props.onPress).toBe('function');
  return new InstalledWebPressResponder({
    onPress: action.props.onPress,
    disabled: action.props.disabled,
  });
}

test('取消 pointerdown 后，真实 RNW click 仍交付菜单、语音和发送操作', () => {
  jest.replaceProperty(Platform, 'OS', 'web');
  const onSelect = jest.fn();
  const onStart = jest.fn();
  const onSend = jest.fn();
  const onChangeText = jest.fn();
  render(
    <Composer
      value="  原文  "
      onChangeText={onChangeText}
      primaryAction={{ kind: 'send', onPress: onSend }}
      actions={[
        { id: 'photo', label: '选择照片', icon: 'image', onPress: onSelect },
      ]}
      voice={{
        status: 'idle',
        onStart,
        onStop: jest.fn(),
        onCancel: jest.fn(),
      }}
    />,
    { wrapper: ThemeProvider }
  );
  for (const label of ['更多操作', '选择照片', '开始语音输入', '发送']) {
    const preventDefault = jest.fn();
    fireEvent(screen.getByRole('button', { name: label }), 'pointerDown', {
      nativeEvent: { pointerType: 'mouse', button: 0 },
      preventDefault,
    });
    expect(preventDefault).toHaveBeenCalledTimes(1);
    fireEvent(screen.getByRole('button', { name: label }), 'pointerUp', {
      nativeEvent: { pointerType: 'mouse', button: 0 },
    });
    const responder = webResponder(label);
    // pointerdown 被取消，不先伪造 responder grant 或 press-in。
    act(() =>
      responder.getEventHandlers().onClick({
        altKey: false,
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
      })
    );
    responder.reset();
  }
  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(onStart).toHaveBeenCalledTimes(1);
  expect(onSend).toHaveBeenCalledWith('  原文  ');
  expect(onChangeText).not.toHaveBeenCalled();
});

test('真实 RNW 键盘路径保留 Tab 默认行为，并让 Enter 打开更多菜单', () => {
  jest.replaceProperty(Platform, 'OS', 'web');
  render(
    <Composer
      value=""
      onChangeText={jest.fn()}
      primaryAction={{ kind: 'send', onPress: jest.fn() }}
      actions={[{ id: 'photo', label: '选择照片', onPress: jest.fn() }]}
    />,
    { wrapper: ThemeProvider }
  );
  const responder = webResponder('更多操作');
  const handlers = responder.getEventHandlers();
  const listeners = new Set<(event: unknown) => void>();
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    'document'
  );
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      addEventListener: (_name: string, handler: (event: unknown) => void) =>
        listeners.add(handler),
      removeEventListener: (_name: string, handler: (event: unknown) => void) =>
        listeners.delete(handler),
    },
  });
  const target = { tagName: 'DIV', getAttribute: () => 'button' };
  const keyEvent = (key: string) => ({
    key,
    target,
    nativeEvent: { type: 'keydown', key, target },
    persist: jest.fn(),
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  });
  try {
    const tab = keyEvent('Tab');
    handlers.onKeyDown(tab);
    expect(tab.preventDefault).not.toHaveBeenCalled();
    expect(listeners.size).toBe(0);
    const enter = keyEvent('Enter');
    act(() => {
      handlers.onKeyDown(enter);
      [...listeners].forEach((listener) => listener(enter));
    });
    expect(enter.preventDefault).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '选择照片' })).toBeOnTheScreen();
  } finally {
    responder.reset();
    if (originalDocument)
      Object.defineProperty(globalThis, 'document', originalDocument);
    else Reflect.deleteProperty(globalThis, 'document');
  }
});
