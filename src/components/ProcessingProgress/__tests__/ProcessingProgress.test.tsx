import { Animated, StyleSheet, Text, View } from 'react-native';
import type { TextProps, ViewProps } from 'react-native';
import { act, cleanup, render } from '@testing-library/react-native';
import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import {
  darkColors,
  lightColors,
  ThemeProvider,
} from '@unif/react-native-design';
import { ProcessingProgress } from '@unif/react-native-chat';

const mockUsePrefersReducedMotion = jest.fn(() => false);

jest.mock('@unif/react-native-design', () => ({
  ...jest.requireActual<typeof import('@unif/react-native-design')>(
    '@unif/react-native-design'
  ),
  usePrefersReducedMotion: () => mockUsePrefersReducedMotion(),
}));

const realLoop = jest.requireActual<{
  default: Pick<typeof Animated, 'loop'>;
}>('react-native/Libraries/Animated/AnimatedImplementation').default.loop;

function controlledTiming(value: Parameters<typeof Animated.timing>[0]) {
  return {
    value,
    start: jest.fn<Animated.CompositeAnimation['start']>(),
    stop: jest.fn(),
    reset: jest.fn(),
    _isUsingNativeDriver: () => false,
    _startNativeLoop: jest.fn(),
  };
}

let animations: ReturnType<typeof controlledTiming>[];

const progressView = (progress: string, dark = false, fontScale = 1) => (
  <ThemeProvider forceScheme={dark ? 'dark' : 'light'} fontScale={fontScale}>
    <ProcessingProgress progress={progress} />
  </ThemeProvider>
);

beforeEach(() => {
  animations = [];
  mockUsePrefersReducedMotion.mockReturnValue(false);
  // Keep RN's loop lifecycle; only replace frames driven by the native clock.
  jest.spyOn(Animated, 'loop').mockImplementation(realLoop);
  jest.spyOn(Animated, 'timing').mockImplementation((value) => {
    const animation = controlledTiming(value);
    animations.push(animation);
    return animation;
  });
});

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

test('包根提供独立的紧凑进度展示', () => {
  expect(ProcessingProgress).toEqual(expect.any(Function));
});

test('真实 RN Web 属性转换保留 busy，并隐藏动画文字避免重复朗读', () => {
  const createDOMProps = jest.requireActual<
    (element: string, props: ViewProps | TextProps) => Record<string, unknown>
  >('react-native-web/dist/cjs/modules/createDOMProps');
  const page = render(progressView('正在读取资料 · 附件一'));
  const root = createDOMProps('div', page.UNSAFE_getByType(View).props);
  const line = page
    .UNSAFE_getAllByType(Text)
    .find((node) => node.props.testID === 'processing-progress-line')!;
  expect(root['aria-busy']).toBe(true);
  expect(root['aria-label']).toBe('正在读取资料 · 附件一');
  expect(root['aria-live']).toBe('polite');
  expect(createDOMProps('div', line.props)['aria-hidden']).toBe(true);
});

test.each([
  ['小U：查找商品 · 商品甲', '小U：查找商品 · 商品乙'],
  ['小U：查找商品·商品甲', '小U：查找商品·商品乙'],
  ['小U：查找商品 ·商品甲', '小U：查找商品 ·商品乙'],
])('后缀更新立即显示完整忙碌文案并保持前缀动画：%s', (first, next) => {
  const page = render(progressView(first));
  expect(
    page.getByRole('text', { name: first }).props.accessibilityState
  ).toEqual({
    busy: true,
  });
  expect(animations[0]!.start).toHaveBeenCalledTimes(1);

  page.rerender(progressView(next));
  expect(
    page.getByRole('text', { name: next }).props.accessibilityLiveRegion
  ).toBe('polite');
  expect(animations).toHaveLength(1);
  expect(animations[0]!.stop).not.toHaveBeenCalled();
  expect(page.getAllByRole('text')).toHaveLength(1);

  page.unmount();
  expect(animations[0]!.stop).toHaveBeenCalledTimes(1);
});

test('只分开首个点号，保留空前缀和所有后续文字', () => {
  const page = render(progressView('· 商品甲 · 附加说明'));
  expect(
    page.getByRole('text', { name: '· 商品甲 · 附加说明' })
  ).toBeOnTheScreen();
  expect(
    page.getByTestId('processing-progress-suffix', {
      includeHiddenElements: true,
    })
  ).toHaveTextContent('· 商品甲 · 附加说明');
  expect(animations).toHaveLength(0);

  page.rerender(progressView('正在准备资料'));
  expect(
    page.queryByTestId('processing-progress-suffix', {
      includeHiddenElements: true,
    })
  ).toBeNull();
  expect(animations).toHaveLength(1);
});

test('前缀更新停止旧动画，迟到完成不能重启旧循环或影响新文字', () => {
  const page = render(progressView('读取资料 · 第一份'));
  const first = animations[0]!;
  const finishFirst = first.start.mock.calls[0]![0]!;

  page.rerender(progressView('整理结果 · 第二份'));
  const second = animations[1]!;
  expect(first.stop).toHaveBeenCalledTimes(1);
  expect(second.value).not.toBe(first.value);
  act(() => finishFirst({ finished: true }));
  expect(first.start).toHaveBeenCalledTimes(1);
  expect(second.start).toHaveBeenCalledTimes(1);
  expect(
    page.getByRole('text', { name: '整理结果 · 第二份' })
  ).toBeOnTheScreen();

  const finishSecond = second.start.mock.calls[0]![0]!;
  page.unmount();
  act(() => finishSecond({ finished: true }));
  expect(second.stop).toHaveBeenCalledTimes(1);
  expect(second.start).toHaveBeenCalledTimes(1);
});

test('减少动态效果切换后显示静态文字，恢复时隔离旧动画', () => {
  const page = render(progressView('正在准备资料'));
  const first = animations[0]!;
  mockUsePrefersReducedMotion.mockReturnValue(true);
  page.rerender(progressView('正在准备资料', true));
  expect(first.stop).toHaveBeenCalledTimes(1);
  expect(page.getByRole('text', { name: '正在准备资料' })).toBeOnTheScreen();
  expect(animations).toHaveLength(1);

  mockUsePrefersReducedMotion.mockReturnValue(false);
  page.rerender(progressView('正在准备资料', false));
  expect(animations).toHaveLength(2);
  expect(animations[1]!.value).not.toBe(first.value);
  act(() => first.start.mock.calls[0]![0]!({ finished: true }));
  expect(first.start).toHaveBeenCalledTimes(1);
});

test('初始减少动态效果时不启动动画，空文字不虚构进度', () => {
  mockUsePrefersReducedMotion.mockReturnValue(true);
  const page = render(progressView('正在准备资料'));
  expect(page.getByRole('text', { name: '正在准备资料' })).toBeOnTheScreen();
  expect(Animated.loop).not.toHaveBeenCalled();
  page.rerender(progressView(''));
  expect(page.getByRole('text').props.accessibilityLabel).toBe('');
  expect(Animated.loop).not.toHaveBeenCalled();
});

test('长中文和大字号共用一个可省略的文字行，主题和字号只应用一次', () => {
  mockUsePrefersReducedMotion.mockReturnValue(true);
  const text =
    '正在整理跨多个门店的商品资料与订单说明 · 请稍候，仍在读取全部内容';
  const page = render(progressView(text));
  const readLine = () =>
    page.getByTestId('processing-progress-line', {
      includeHiddenElements: true,
    });
  const normal = StyleSheet.flatten(readLine().props.style);
  expect(normal.color).toBe(lightColors.foregroundMuted);

  page.rerender(progressView(text, true, 1.5));
  const line = readLine();
  const large = StyleSheet.flatten(line.props.style);
  expect(line.props.numberOfLines).toBe(1);
  expect(line.props.ellipsizeMode).toBe('tail');
  expect(line.props.allowFontScaling).not.toBe(false);
  expect(line).toHaveTextContent(text);
  expect(large.fontSize).toBeCloseTo(normal.fontSize * 1.5);
  expect(large.lineHeight).toBeCloseTo(normal.lineHeight * 1.5);
  expect(large.color).toBe(darkColors.foregroundMuted);
  expect(page.getByRole('text', { name: text })).toBeOnTheScreen();
});
