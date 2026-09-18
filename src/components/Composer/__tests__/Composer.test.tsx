import { createRef } from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { describe, expect, jest, test } from '@jest/globals';
import { Textarea, ThemeProvider } from '@unif/react-native-design';
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
    expect(screen.getByRole('button', { name: '发送' })).toBeDisabled();
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
        { id: 'pick', label: '选择文件', onPress },
        { id: 'busy', label: '准备文件', loading: true, onPress },
      ],
    });
    fireEvent.press(screen.getByRole('button', { name: '更多操作' }));
    fireEvent.press(screen.getByRole('button', { name: '准备文件' }));
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
  expect(input.props.maxHeight).toBe(180);
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
  expect(screen.UNSAFE_getByType(Textarea).props.maxHeight).toBe(120);
  fireEvent.press(screen.getByRole('button', { name: '开始语音输入' }));
  expect(voice.onStart).not.toHaveBeenCalled();
});
