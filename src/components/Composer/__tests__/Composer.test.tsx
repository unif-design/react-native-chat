import { createRef } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { describe, expect, jest, test } from '@jest/globals';
import {
  Textarea,
  ThemeProvider,
  space,
  type as typography,
} from '@unif/react-native-design';
import { Composer } from '..';
import type { ComposerHandle, ComposerProps, ComposerVoiceStatus } from '..';

const renderComposer = (props: ComposerProps) =>
  render(<Composer {...props} />, { wrapper: ThemeProvider });

describe('Composer', () => {
  test('受控编辑和发送交付原文，点击后不清空或变忙', () => {
    const onChangeText = jest.fn();
    const onSend = jest.fn();
    renderComposer({
      value: '  商品甲\n两箱 ',
      onChangeText,
      primaryAction: { kind: 'send', onPress: onSend },
    });
    fireEvent.changeText(screen.getByLabelText('消息输入框'), '新草稿');
    expect(onChangeText).toHaveBeenCalledWith('新草稿');
    fireEvent.press(screen.getByRole('button', { name: '发送' }));
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith('  商品甲\n两箱 ');
    expect(screen.getByDisplayValue('  商品甲\n两箱 ')).toBeOnTheScreen();
  });

  test('空文本、allowEmpty、editable 和全局 disabled 的边界', () => {
    const onSend = jest.fn();
    const props: ComposerProps = {
      value: ' \n',
      onChangeText: jest.fn(),
      primaryAction: { kind: 'send', onPress: onSend },
    };
    const view = renderComposer(props);
    expect(screen.queryByRole('button', { name: '发送' })).toBeNull();
    view.rerender(
      <Composer
        {...props}
        editable={false}
        primaryAction={{ kind: 'send', allowEmpty: true, onPress: onSend }}
      />
    );
    fireEvent.press(screen.getByRole('button', { name: '发送' }));
    expect(onSend).toHaveBeenCalledWith(' \n');
    view.rerender(
      <Composer
        {...props}
        disabled
        primaryAction={{ kind: 'send', allowEmpty: true, onPress: onSend }}
      />
    );
    fireEvent.press(screen.getByRole('button', { name: '发送' }));
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('消息输入框').props.editable).toBe(false);
  });

  test('停止和忙碌仅采用当前主动作', () => {
    const onStop = jest.fn();
    const props = { value: '保留', onChangeText: jest.fn() };
    const view = renderComposer({
      ...props,
      primaryAction: { kind: 'stop', onPress: onStop },
    });
    fireEvent.press(screen.getByRole('button', { name: '停止回复' }));
    expect(onStop).toHaveBeenCalledTimes(1);
    view.rerender(<Composer {...props} primaryAction={{ kind: 'busy' }} />);
    expect(screen.getByRole('button', { name: '正在处理…' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: '发送' })).toBeNull();
    expect(screen.getByDisplayValue('保留')).toBeOnTheScreen();
  });

  test('更多菜单按操作状态交付一次并关闭，焦点变化也收起', () => {
    const onPress = jest.fn();
    const onFocusChange = jest.fn();
    renderComposer({
      value: '',
      onChangeText: jest.fn(),
      primaryAction: { kind: 'busy' },
      onFocusChange,
      actions: [
        { id: 'pick', label: '选择文件', icon: 'file', onPress },
        { id: 'busy', label: '准备文件', loading: true, onPress },
        { id: 'unnamed', label: ' ', icon: 'file', onPress },
      ],
    });
    fireEvent.press(screen.getByRole('button', { name: '更多操作' }));
    expect(
      StyleSheet.flatten(screen.getByTestId('composer-menu').props.style)
    ).toMatchObject({
      position: 'absolute',
      bottom: '100%',
      left: space[6],
    });
    expect(
      StyleSheet.flatten(
        screen.getByTestId('composer-menu-content').props.style
      ).overflow
    ).toBe('hidden');
    expect(
      StyleSheet.flatten(
        screen.getByTestId('composer-menu-icon-pick', {
          includeHiddenElements: true,
        }).props.style
      )
    ).toMatchObject({ width: 40, height: 40, borderRadius: 20 });
    expect(
      screen.getByRole('button', { name: '准备文件' }).props.accessibilityState
    ).toMatchObject({ disabled: true, busy: true });
    fireEvent.press(screen.getByRole('button', { name: '准备文件' }));
    fireEvent.press(
      screen.getByTestId('composer-menu-icon-unnamed', {
        includeHiddenElements: true,
      })
    );
    expect(screen.queryByRole('button', { name: ' ' })).toBeNull();
    expect(onPress).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: '选择文件' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: '选择文件' })).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: '更多操作' }));
    fireEvent(screen.getByLabelText('消息输入框'), 'focus', {
      nativeEvent: {},
    });
    expect(onFocusChange).toHaveBeenLastCalledWith(true);
    expect(screen.queryByRole('button', { name: '选择文件' })).toBeNull();
    fireEvent(screen.getByLabelText('消息输入框'), 'blur', { nativeEvent: {} });
    expect(onFocusChange).toHaveBeenLastCalledWith(false);
  });

  test('发送和开始语音先收起菜单，事件不清空文字', () => {
    const onSend = jest.fn();
    const onStart = jest.fn();
    renderComposer({
      value: '保留原文',
      onChangeText: jest.fn(),
      primaryAction: { kind: 'send', onPress: onSend },
      voice: {
        status: 'idle',
        onStart,
        onStop: jest.fn(),
        onCancel: jest.fn(),
      },
      actions: [{ id: 'photo', label: '选择照片', onPress: jest.fn() }],
    });
    fireEvent.press(screen.getByRole('button', { name: '更多操作' }));
    fireEvent.press(screen.getByRole('button', { name: '发送' }));
    expect(screen.queryByTestId('composer-menu')).toBeNull();
    expect(onSend).toHaveBeenCalledWith('保留原文');
    fireEvent.press(screen.getByRole('button', { name: '更多操作' }));
    fireEvent.press(screen.getByRole('button', { name: '开始语音输入' }));
    expect(screen.queryByTestId('composer-menu')).toBeNull();
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(screen.getByDisplayValue('保留原文')).toBeOnTheScreen();
  });

  test.each<ComposerVoiceStatus>([
    'idle',
    'starting',
    'listening',
    'finishing',
  ])('语音 %s 仅展示和交付允许的事件', (status) => {
    const onStart = jest.fn();
    const onStop = jest.fn();
    const onCancel = jest.fn();
    const onChangeText = jest.fn();
    renderComposer({
      value: '原草稿',
      onChangeText,
      primaryAction: { kind: 'send', onPress: jest.fn() },
      voice: { status, transcript: '识别中的文字', onStart, onStop, onCancel },
    });
    if (status === 'idle') {
      fireEvent.press(screen.getByRole('button', { name: '开始语音输入' }));
      expect(onStart).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('识别中的文字')).toBeNull();
    } else {
      expect(screen.queryByRole('button', { name: '发送' })).toBeNull();
      if (status === 'listening') {
        fireEvent.press(screen.getByRole('button', { name: '停止语音输入' }));
        expect(onStop).toHaveBeenCalledTimes(1);
      } else {
        expect(
          screen.queryByRole('button', { name: '停止语音输入' })
        ).toBeNull();
      }
      fireEvent.press(screen.getByRole('button', { name: '取消语音输入' }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    }
    expect(onChangeText).not.toHaveBeenCalled();
  });

  test('根测量仅在高度变化时交付，包含内容位置；ref 只有 focus/blur', () => {
    const onHeightChange = jest.fn();
    const ref = createRef<ComposerHandle>();
    render(
      <ThemeProvider>
        <Composer
          ref={ref}
          testID="composer"
          value=""
          onChangeText={jest.fn()}
          primaryAction={{ kind: 'busy' }}
          onHeightChange={onHeightChange}
          header={<Text>附件位置</Text>}
          footer={<Text>说明位置</Text>}
        />
      </ThemeProvider>
    );
    for (const height of [160, 160, 210])
      fireEvent(screen.getByTestId('composer'), 'layout', {
        nativeEvent: { layout: { width: 320, height, x: 0, y: 0 } },
      });
    expect(onHeightChange.mock.calls).toEqual([[160], [210]]);
    expect(Object.keys(ref.current!)).toEqual(['focus', 'blur']);
    expect(screen.getByText('附件位置')).toBeOnTheScreen();
    expect(screen.getByText('说明位置')).toBeOnTheScreen();
  });
});

test('空白时同一行，聚焦或有文字后展开且不重新挂载 Textarea', () => {
  const props: ComposerProps = {
    value: '',
    onChangeText: jest.fn(),
    primaryAction: { kind: 'send', onPress: jest.fn() },
    actions: [
      { id: 'photo', label: '选择照片', icon: 'image', onPress: jest.fn() },
    ],
    voice: {
      status: 'idle',
      onStart: jest.fn(),
      onStop: jest.fn(),
      onCancel: jest.fn(),
    },
  };
  const view = renderComposer(props);
  const textarea = screen.UNSAFE_getByType(Textarea);
  const nativeInput = screen.UNSAFE_getByType(TextInput).instance;
  expect(textarea.props.surface).toBe('plain');
  expect(
    StyleSheet.flatten(screen.getByTestId('composer-regular').props.style)
      .flexDirection
  ).toBe('row');
  fireEvent(screen.getByLabelText('消息输入框'), 'focus', { nativeEvent: {} });
  expect(
    StyleSheet.flatten(screen.getByTestId('composer-regular').props.style)
      .flexDirection
  ).toBe('column');
  expect(screen.UNSAFE_getByType(TextInput).instance).toBe(nativeInput);
  view.rerender(<Composer {...props} value="已经输入" />);
  fireEvent(screen.getByLabelText('消息输入框'), 'blur', { nativeEvent: {} });
  expect(
    StyleSheet.flatten(screen.getByTestId('composer-regular').props.style)
      .flexDirection
  ).toBe('column');
  expect(screen.UNSAFE_getByType(TextInput).instance).toBe(nativeInput);
  expect(screen.getByRole('button', { name: '发送' })).toBeOnTheScreen();
  expect(screen.queryByText('发送')).toBeNull();
  view.rerender(<Composer {...props} />);
  expect(
    StyleSheet.flatten(screen.getByTestId('composer-regular').props.style)
      .flexDirection
  ).toBe('row');
  expect(screen.UNSAFE_getByType(TextInput).instance).toBe(nativeInput);
});

test('统一卡片可交给外层，两个表面均使用无独立表面的 Textarea', () => {
  const props: ComposerProps = {
    value: '',
    onChangeText: jest.fn(),
    primaryAction: { kind: 'busy' },
    testID: 'composer',
  };
  const view = renderComposer(props);
  expect(
    StyleSheet.flatten(screen.getByTestId('composer').props.style)
  ).toMatchObject({ borderWidth: 0.5 });
  expect(screen.UNSAFE_getByType(Textarea).props.surface).toBe('plain');
  view.rerender(<Composer {...props} surface="plain" />);
  const root = StyleSheet.flatten(screen.getByTestId('composer').props.style);
  expect(root.borderWidth).toBeUndefined();
  expect(root.backgroundColor).toBeUndefined();
  expect(screen.UNSAFE_getByType(Textarea).props.surface).toBe('plain');
});

test('空输入失焦后保留原加号与 Textarea 实例，原按钮仍可打开菜单并交付操作', () => {
  const onSelect = jest.fn();
  renderComposer({
    value: '',
    onChangeText: jest.fn(),
    primaryAction: { kind: 'send', onPress: jest.fn() },
    actions: [{ id: 'photo', label: '选择照片', onPress: onSelect }],
  });
  const input = screen.UNSAFE_getByType(TextInput).instance;
  const compactMore = screen.getByRole('button', { name: '更多操作' });
  fireEvent(screen.getByLabelText('消息输入框'), 'focus', { nativeEvent: {} });
  const focusedMore = screen.getByRole('button', { name: '更多操作' });
  expect(focusedMore).toBe(compactMore);
  expect(screen.UNSAFE_getByType(TextInput).instance).toBe(input);
  fireEvent(screen.getByLabelText('消息输入框'), 'blur', { nativeEvent: {} });
  expect(screen.getByRole('button', { name: '更多操作' })).toBe(focusedMore);
  expect(screen.UNSAFE_getByType(TextInput).instance).toBe(input);
  fireEvent.press(focusedMore);
  expect(screen.getByRole('button', { name: '选择照片' })).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: '选择照片' }));
  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId('composer-menu')).toBeNull();
});

test('真实 Textarea 接收字体相关高度、ref 转交且进入语音时失焦', () => {
  const inputRef = createRef<ComposerHandle>();
  const voice = {
    status: 'idle' as const,
    onStart: jest.fn(),
    onStop: jest.fn(),
    onCancel: jest.fn(),
  };
  const props: ComposerProps = {
    value: '保留草稿',
    onChangeText: jest.fn(),
    primaryAction: { kind: 'busy' },
    voice,
  };
  const view = render(
    <ThemeProvider fontScale={1.5}>
      <Composer ref={inputRef} {...props} />
    </ThemeProvider>
  );
  const input = screen.UNSAFE_getByType(Textarea);
  expect(input.props.minHeight).toBe(44);
  expect(input.props.maxHeight).toBe(
    Math.round(typography.body * 1.4) * 4 * 1.5 + 2 * space[4]
  );
  const focus = jest.spyOn(input.props.ref.current, 'focus');
  const blur = jest.spyOn(input.props.ref.current, 'blur');
  inputRef.current?.focus();
  expect(focus).toHaveBeenCalledTimes(1);
  view.rerender(
    <ThemeProvider fontScale={1.5}>
      <Composer
        ref={inputRef}
        {...props}
        voice={{ ...voice, status: 'listening', disabled: true }}
      />
    </ThemeProvider>
  );
  expect(blur).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByRole('button', { name: '停止语音输入' }));
  fireEvent.press(screen.getByRole('button', { name: '取消语音输入' }));
  expect(voice.onStop).not.toHaveBeenCalled();
  expect(voice.onCancel).not.toHaveBeenCalled();
  expect(props.onChangeText).not.toHaveBeenCalled();
  view.rerender(
    <ThemeProvider>
      <Composer {...props} minInputHeight={20} maxInputHeight={NaN} disabled />
    </ThemeProvider>
  );
  expect(screen.UNSAFE_getByType(Textarea).props.minHeight).toBe(44);
  expect(screen.UNSAFE_getByType(Textarea).props.maxHeight).toBe(
    Math.round(typography.body * 1.4) * 4 + 2 * space[4]
  );
  fireEvent.press(screen.getByRole('button', { name: '开始语音输入' }));
  expect(voice.onStart).not.toHaveBeenCalled();
});
