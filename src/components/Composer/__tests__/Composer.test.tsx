import { FileOutlined, ImageOutlined } from '@unif/react-native-icons';
import { createRef } from 'react';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import * as LiquidGlass from '@callstack/liquid-glass';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { describe, expect, jest, test } from '@jest/globals';
import {
  ActionMenuContent,
  GlassLayer,
  Textarea,
  ThemeProvider,
  space,
  lightColors,
  darkColors,
  lightShadow,
  darkShadow,
  type as typography,
} from '@unif/react-native-design';
import { Composer } from '..';
import type { ComposerHandle, ComposerProps, ComposerVoiceStatus } from '..';
import { ComposerIconAction } from '../ComposerIconAction';

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

  test('更多操作先让输入失焦，公共浮菜单按操作状态交付一次并关闭', () => {
    const onPress = jest.fn();
    const onFocusChange = jest.fn();
    renderComposer({
      value: '',
      onChangeText: jest.fn(),
      primaryAction: { kind: 'busy' },
      onFocusChange,
      actions: [
        {
          id: 'pick',
          label: '选择文件',
          icon: FileOutlined,
          accessibilityHint: '从设备选择文件',
          onPress,
        },
        { id: 'busy', label: '准备文件', loading: true, onPress },
        { id: 'disabled', label: '不可用文件', disabled: true, onPress },
        { id: 'unnamed', label: ' ', icon: FileOutlined, onPress },
      ],
    });
    const input = screen.UNSAFE_getByType(TextInput).instance;
    const blur = jest.spyOn(
      screen.UNSAFE_getByType(Textarea).props.ref.current,
      'blur'
    );
    fireEvent(screen.getByLabelText('消息输入框'), 'focus', {
      nativeEvent: {},
    });
    fireEvent.press(screen.getByRole('button', { name: '更多操作' }));
    expect(blur).toHaveBeenCalledTimes(1);
    fireEvent(screen.getByLabelText('消息输入框'), 'blur', { nativeEvent: {} });
    expect(onFocusChange).toHaveBeenLastCalledWith(false);
    expect(screen.UNSAFE_getByType(ActionMenuContent).props.presentation).toBe(
      'popover'
    );
    expect(screen.UNSAFE_getByType(TextInput).instance).toBe(input);
    expect(
      StyleSheet.flatten(screen.getByTestId('composer-menu').props.style)
    ).toMatchObject({
      position: 'absolute',
      bottom: '100%',
      left: space[6],
    });
    expect(screen.getByRole('button', { name: '选择文件' })).toHaveProp(
      'accessibilityHint',
      '从设备选择文件'
    );
    expect(screen.queryByRole('button', { name: '取消' })).toBeNull();
    expect(
      screen.getByRole('button', { name: '准备文件' }).props.accessibilityState
    ).toMatchObject({ disabled: true, busy: true });
    expect(screen.getByRole('button', { name: '不可用文件' })).toBeDisabled();
    fireEvent.press(screen.getByRole('button', { name: '准备文件' }));
    fireEvent.press(screen.getByRole('button', { name: '不可用文件' }));
    fireEvent.press(screen.getByText(' ', { normalizer: (text) => text }));
    expect(screen.queryByRole('button', { name: ' ' })).toBeNull();
    expect(onPress).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: '选择文件' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith();
    expect(screen.queryByRole('button', { name: '选择文件' })).toBeNull();
    expect(screen.UNSAFE_getByType(TextInput).instance).toBe(input);
    fireEvent.press(screen.getByRole('button', { name: '更多操作' }));
    fireEvent(screen.getByLabelText('消息输入框'), 'focus', {
      nativeEvent: {},
    });
    expect(onFocusChange).toHaveBeenLastCalledWith(true);
    expect(screen.queryByRole('button', { name: '选择文件' })).toBeNull();
    fireEvent(screen.getByLabelText('消息输入框'), 'blur', { nativeEvent: {} });
    expect(onFocusChange).toHaveBeenLastCalledWith(false);
  });

  test.each(['更多操作', '收起更多操作', '消息输入框'])(
    '%s 收起浮菜单并保留输入和草稿',
    (label) => {
      const onPress = jest.fn();
      const onChangeText = jest.fn();
      renderComposer({
        value: '保留草稿',
        onChangeText,
        primaryAction: { kind: 'busy' },
        actions: [{ id: 'file', label: '选择文件', onPress }],
      });
      const input = screen.UNSAFE_getByType(TextInput).instance;
      fireEvent.press(screen.getByRole('button', { name: '更多操作' }));
      if (label === '消息输入框')
        fireEvent(screen.getByLabelText(label), 'pressIn');
      else fireEvent.press(screen.getByRole('button', { name: label }));
      expect(screen.queryByTestId('composer-menu')).toBeNull();
      expect(screen.UNSAFE_getByType(TextInput).instance).toBe(input);
      expect(screen.getByDisplayValue('保留草稿')).toBeOnTheScreen();
      expect(onPress).not.toHaveBeenCalled();
      expect(onChangeText).not.toHaveBeenCalled();
    }
  );

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
      } else if (status === 'finishing') {
        expect(
          screen.getByRole('button', { name: '停止语音输入' })
        ).toBeDisabled();
        fireEvent.press(screen.getByRole('button', { name: '停止语音输入' }));
        expect(onStop).not.toHaveBeenCalled();
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
      {
        id: 'photo',
        label: '选择照片',
        icon: ImageOutlined,
        onPress: jest.fn(),
      },
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

test('原生玻璃卡片不裁切浮菜单，切为 plain 保留输入并交由外层提供表面', () => {
  const support = jest.replaceProperty(
    LiquidGlass as { isLiquidGlassSupported: boolean },
    'isLiquidGlassSupported',
    true
  );
  const props: ComposerProps = {
    value: '',
    onChangeText: jest.fn(),
    primaryAction: { kind: 'busy' },
    testID: 'composer',
  };
  const view = renderComposer(props);
  const input = screen.UNSAFE_getByType(TextInput).instance;
  const card = StyleSheet.flatten(screen.getByTestId('composer').props.style);
  expect(card).toMatchObject({ borderWidth: 0.5 });
  expect(card.backgroundColor).toBeUndefined();
  expect(card.overflow).not.toBe('hidden');
  expect(screen.UNSAFE_getByType(GlassLayer)).toBeDefined();
  expect(screen.UNSAFE_getByType(Textarea).props.surface).toBe('plain');
  view.rerender(<Composer {...props} surface="plain" />);
  const root = StyleSheet.flatten(screen.getByTestId('composer').props.style);
  expect(root.borderWidth).toBeUndefined();
  expect(root.backgroundColor).toBeUndefined();
  expect(screen.UNSAFE_queryAllByType(GlassLayer)).toHaveLength(0);
  expect(screen.UNSAFE_getByType(TextInput).instance).toBe(input);
  expect(screen.UNSAFE_getByType(Textarea).props.surface).toBe('plain');
  support.restore();
});

test('空输入失焦后保留原加号、Textarea 实例与原生堆叠层级，原按钮仍可交付操作', () => {
  const onSelect = jest.fn();
  renderComposer({
    value: '',
    onChangeText: jest.fn(),
    primaryAction: { kind: 'send', onPress: jest.fn() },
    actions: [{ id: 'photo', label: '选择照片', onPress: onSelect }],
  });
  const input = screen.UNSAFE_getByType(TextInput).instance;
  const compactMore = screen.getByRole('button', { name: '更多操作' });
  const more = screen
    .UNSAFE_getAllByType(ComposerIconAction)
    .find((node) => node.props.label === '更多操作')!;
  const moreContainer = more.parent!;
  const compactZIndex = StyleSheet.flatten(moreContainer.props.style).zIndex;
  fireEvent(screen.getByLabelText('消息输入框'), 'focus', { nativeEvent: {} });
  const focusedMore = screen.getByRole('button', { name: '更多操作' });
  expect(focusedMore).toBe(compactMore);
  expect(screen.UNSAFE_getByType(TextInput).instance).toBe(input);
  expect(more.parent).toBe(moreContainer);
  expect(StyleSheet.flatten(moreContainer.props.style).zIndex).toBe(
    compactZIndex
  );
  fireEvent(screen.getByLabelText('消息输入框'), 'blur', { nativeEvent: {} });
  expect(screen.getByRole('button', { name: '更多操作' })).toBe(focusedMore);
  expect(screen.UNSAFE_getByType(TextInput).instance).toBe(input);
  expect(StyleSheet.flatten(moreContainer.props.style).zIndex).toBe(
    compactZIndex
  );
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
    Math.round(typography.body * 1.4) * 4 * 1.5 + 2 * space[3]
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
    Math.round(typography.body * 1.4) * 4 + 2 * space[3]
  );
  fireEvent.press(screen.getByRole('button', { name: '开始语音输入' }));
  expect(voice.onStart).not.toHaveBeenCalled();
});

test('附件忙碌只禁用对应菜单项，加号仍可查看与收起菜单', () => {
  const props: ComposerProps = {
    value: '',
    onChangeText: jest.fn(),
    primaryAction: { kind: 'send', onPress: jest.fn() },
    actions: [{ id: 'photo', label: '照片', onPress: jest.fn() }],
  };
  const view = renderComposer(props);
  fireEvent.press(screen.getByRole('button', { name: '更多操作' }));
  expect(screen.getByRole('button', { name: '照片' })).toBeOnTheScreen();
  view.rerender(
    <Composer
      {...props}
      actions={props.actions!.map((action) => ({ ...action, disabled: true }))}
    />
  );
  expect(screen.getByRole('button', { name: '更多操作' })).toBeEnabled();
  expect(screen.getByTestId('composer-menu')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: '照片' })).toBeDisabled();
  fireEvent.press(screen.getByRole('button', { name: '照片' }));
  expect(props.actions![0]!.onPress).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: '更多操作' }));
  expect(screen.queryByTestId('composer-menu')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: '更多操作' }));
  expect(screen.getByTestId('composer-menu')).toBeOnTheScreen();
  view.rerender(<Composer {...props} disabled />);
  expect(screen.getByRole('button', { name: '更多操作' })).toBeDisabled();
  expect(screen.queryByTestId('composer-menu')).toBeNull();
});

test('命令式失焦、无高度订阅与菜单自行关闭均不修改草稿', () => {
  const ref = createRef<ComposerHandle>();
  const onChangeText = jest.fn();
  render(
    <Composer
      ref={ref}
      testID="composer"
      value="草稿"
      onChangeText={onChangeText}
      primaryAction={{ kind: 'send', onPress: jest.fn() }}
      actions={[{ id: 'pick', label: '选择', onPress: jest.fn() }]}
    />,
    { wrapper: ThemeProvider }
  );
  const blur = jest.spyOn(
    screen.UNSAFE_getByType(Textarea).props.ref.current,
    'blur'
  );
  ref.current?.blur();
  expect(blur).toHaveBeenCalledTimes(1);
  fireEvent(screen.getByTestId('composer'), 'layout', {
    nativeEvent: { layout: { width: 320, height: 80, x: 0, y: 0 } },
  });
  fireEvent.press(screen.getByRole('button', { name: '更多操作' }));
  fireEvent(screen.UNSAFE_getByType(ActionMenuContent), 'close');
  expect(screen.queryByTestId('composer-menu')).toBeNull();
  expect(onChangeText).not.toHaveBeenCalled();
});

test('菜单与主动作的禁用状态拒绝已排队的回调', () => {
  const onPress = jest.fn();
  const props: ComposerProps = {
    value: '草稿',
    onChangeText: jest.fn(),
    primaryAction: { kind: 'send', onPress },
    actions: [
      { id: 'disabled', label: '禁用', disabled: true, onPress },
      { id: 'loading', label: '加载', loading: true, onPress },
    ],
  };
  const view = renderComposer(props);
  fireEvent.press(screen.getByRole('button', { name: '更多操作' }));
  const menu = screen.UNSAFE_getByType(ActionMenuContent);
  menu.props.actions.forEach((action: { onPress(): void }) => action.onPress());
  expect(onPress).not.toHaveBeenCalled();
  view.rerender(<Composer {...props} primaryAction={{ kind: 'busy' }} />);
  const primary = screen
    .UNSAFE_getAllByType(ComposerIconAction)
    .find((node) => node.props.busy);
  primary?.props.onPress();
  expect(onPress).not.toHaveBeenCalled();
});

test('显式高度与主动作名称保持消费者提供的值，禁用时ref不聚焦', () => {
  const ref = createRef<ComposerHandle>();
  render(
    <Composer
      ref={ref}
      disabled
      value="文字"
      onChangeText={jest.fn()}
      surface="plain"
      header={<Text>自定义头部</Text>}
      minInputHeight={60}
      maxInputHeight={120}
      primaryAction={{ kind: 'send', label: '提交草稿', onPress: jest.fn() }}
    />,
    { wrapper: ThemeProvider }
  );
  const input = screen.UNSAFE_getByType(Textarea);
  const focus = jest.spyOn(input.props.ref.current, 'focus');
  ref.current?.focus();
  expect(focus).not.toHaveBeenCalled();
  expect(input.props.minHeight).toBe(60);
  expect(input.props.maxHeight).toBe(120);
  expect(screen.getByRole('button', { name: '提交草稿' })).toBeDisabled();
  expect(screen.getByText('自定义头部')).toBeOnTheScreen();
});

// 将真实 Composer / Textarea 的输入 props 交给 RNW，验证浏览器实际输出。
function renderComposerWebInput() {
  const { View: WebView, TextInput: WebTextInput } = jest.requireActual<{
    View: typeof View;
    TextInput: typeof TextInput;
  }>('react-native-web');
  const { renderToStaticMarkup } = jest.requireActual<{
    renderToStaticMarkup(node: ReactNode): string;
  }>('react-dom/server');
  const regular = screen
    .UNSAFE_getAllByType(View)
    .find((node) => node.props.testID === 'composer-regular')!;
  const input = screen.UNSAFE_getByType(TextInput);
  return renderToStaticMarkup(
    <WebView {...regular.props}>
      <WebTextInput {...input.props} />
    </WebView>
  );
}

test.each(['', '原草稿'])(
  '语音期间保留输入的宽度测量，长文写回后恢复同一可编辑输入（初值：%s）',
  async (initialValue) => {
    const onChangeText = jest.fn();
    const onSend = jest.fn();
    const voice = {
      status: 'idle' as const,
      onStart: jest.fn(),
      onStop: jest.fn(),
      onCancel: jest.fn(),
    };
    const props: ComposerProps = {
      value: initialValue,
      onChangeText,
      primaryAction: { kind: 'send', onPress: onSend },
      voice,
    };
    const view = renderComposer(props);
    await act(async () => {
      await Promise.resolve();
    });
    const input = screen.getByLabelText('消息输入框');
    const textarea = screen.UNSAFE_getByType(Textarea);
    const blur = jest.spyOn(textarea.props.ref.current, 'blur');
    fireEvent(input, 'focus', { nativeEvent: {} });

    view.rerender(
      <Composer {...props} voice={{ ...voice, status: 'listening' }} />
    );
    const regular = screen.getByTestId('composer-regular', {
      includeHiddenElements: true,
    });
    const hiddenStyle = StyleSheet.flatten(regular.props.style);
    // display:none 会跳过整棵输入的原生测量；隐藏期间也须保留测量条件。
    expect(hiddenStyle.display).not.toBe('none');
    expect(hiddenStyle).toMatchObject({
      position: 'absolute',
      left: 0,
      right: 0,
      opacity: 0,
    });
    expect(regular.props.pointerEvents).toBe('none');
    expect(regular.props.accessibilityElementsHidden).toBe(true);
    expect(regular.props.importantForAccessibility).toBe('no-hide-descendants');
    const hiddenMarkup = renderComposerWebInput();
    expect(hiddenMarkup.match(/<div[^>]*>/)?.[0]).toContain(
      'aria-hidden="true"'
    );
    expect(hiddenMarkup.match(/<textarea[^>]*>/)?.[0]).toContain(
      'tabindex="-1"'
    );
    expect(screen.queryByLabelText('消息输入框')).toBeNull();
    expect(screen.queryByRole('button', { name: '发送' })).toBeNull();
    if (initialValue) {
      expect(
        screen.getByLabelText('发送', { includeHiddenElements: true })
      ).toBeDisabled();
    }
    expect(
      screen.getByLabelText('开始语音输入', { includeHiddenElements: true })
    ).toBeDisabled();
    expect(input.props.editable).toBe(false);
    expect(blur).toHaveBeenCalledTimes(1);

    view.rerender(
      <Composer {...props} voice={{ ...voice, status: 'finishing' }} />
    );
    const text =
      '统一冰红茶二十箱，老坛酸菜三十箱，小明同学二十箱，红袖十箱。\n再加两箱方便面。';
    view.rerender(<Composer {...props} value={text} />);
    expect(screen.UNSAFE_getByType(Textarea)).toBe(textarea);
    expect(screen.getByLabelText('消息输入框')).toBe(input);
    expect(input.props.value).toBe(text);
    expect(input.props.editable).toBe(true);
    expect(StyleSheet.flatten(regular.props.style).position).not.toBe(
      'absolute'
    );
    expect(regular.props.pointerEvents).toBe('auto');
    expect(regular.props.accessibilityElementsHidden).toBe(false);
    expect(regular.props.importantForAccessibility).toBe('auto');
    const visibleMarkup = renderComposerWebInput();
    expect(visibleMarkup.match(/<div[^>]*>/)?.[0]).not.toContain(
      'aria-hidden="true"'
    );
    expect(visibleMarkup.match(/<textarea[^>]*>/)?.[0]).not.toContain(
      'tabindex="-1"'
    );
    expect(StyleSheet.flatten(input.props.style).height).toBeUndefined();
    expect(input.props.scrollEnabled).toBe(true);
    expect(onChangeText).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: '发送' }));
    expect(onSend).toHaveBeenCalledWith(text);
    blur.mockRestore();
  }
);

test.each([
  ['ios', false, true],
  ['android', false, true],
  ['ios', true, false],
  ['web', false, false],
] as const)(
  '%s 原生玻璃=%s 时卡片仅在原生降级绘制中性边界，plain 不叠加表面',
  async (platform, supported, fallback) => {
    const platformProperty = jest.replaceProperty(Platform, 'OS', platform);
    const supportProperty = jest.replaceProperty(
      LiquidGlass as { isLiquidGlassSupported: boolean },
      'isLiquidGlassSupported',
      supported
    );
    try {
      const props: ComposerProps = {
        value: '保留的订单原稿',
        onChangeText: jest.fn(),
        primaryAction: { kind: 'busy' },
        testID: 'composer',
      };
      const view = render(
        <ThemeProvider forceScheme="light">
          <Composer {...props} />
        </ThemeProvider>
      );
      const input = screen.UNSAFE_getByType(TextInput).instance;
      for (const scheme of ['light', 'dark'] as const) {
        view.rerender(
          <ThemeProvider forceScheme={scheme}>
            <Composer {...props} />
          </ThemeProvider>
        );
        await act(async () => {});
        const colors = scheme === 'light' ? lightColors : darkColors;
        const shadow = scheme === 'light' ? lightShadow : darkShadow;
        const card = StyleSheet.flatten(
          screen.getByTestId('composer').props.style
        );
        expect(card).toMatchObject({
          borderWidth: 0.5,
          borderColor: fallback ? colors.outlineVariant : colors.glassBorder,
          ...(fallback ? shadow.subtle : shadow.card),
        });
        expect(card.backgroundColor).toBe(
          fallback ? colors.surface : undefined
        );
        expect(card.overflow).not.toBe('hidden');
        expect(screen.UNSAFE_getByType(TextInput).instance).toBe(input);
        expect(screen.getByDisplayValue('保留的订单原稿')).toBeOnTheScreen();
      }
      view.rerender(
        <ThemeProvider forceScheme="dark">
          <Composer {...props} surface="plain" />
        </ThemeProvider>
      );
      const plain = StyleSheet.flatten(
        screen.getByTestId('composer').props.style
      );
      expect(plain.borderWidth).toBeUndefined();
      expect(plain.backgroundColor).toBeUndefined();
      expect(plain.shadowOpacity).toBeUndefined();
      expect(screen.UNSAFE_queryAllByType(GlassLayer)).toHaveLength(0);
      expect(screen.UNSAFE_getByType(TextInput).instance).toBe(input);
    } finally {
      platformProperty.restore();
      supportProperty.restore();
    }
  }
);
