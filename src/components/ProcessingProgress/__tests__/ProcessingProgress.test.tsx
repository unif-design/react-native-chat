import {
  AccessibilityInfo,
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { TextProps, ViewProps } from 'react-native';
import { act, cleanup, render } from '@testing-library/react-native';
import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import {
  darkColors,
  lightColors,
  ThemeProvider,
} from '@unif/react-native-design';
import { ProcessingProgress } from '@unif/react-native-chat';

const reanimated = jest.requireMock<typeof import('react-native-reanimated')>(
  'react-native-reanimated'
);

const progressView = (progress: string, dark = false, fontScale = 1) => (
  <ThemeProvider forceScheme={dark ? 'dark' : 'light'} fontScale={fontScale}>
    <ProcessingProgress progress={progress} />
  </ThemeProvider>
);

beforeEach(() => {
  jest.useFakeTimers();
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
  jest
    .spyOn(AccessibilityInfo, 'isReduceTransparencyEnabled')
    .mockResolvedValue(true);
  jest.spyOn(reanimated, 'useReducedMotion').mockReturnValue(false);
});

afterEach(() => {
  cleanup();
  jest.useRealTimers();
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
  act(() => jest.advanceTimersByTime(400));
  const loops = jest.mocked(Animated.loop).mock.calls.length;
  expect(loops).toBeGreaterThan(0);

  page.rerender(progressView(next));
  expect(
    page.getByRole('text', { name: next }).props.accessibilityLiveRegion
  ).toBe('polite');
  expect(jest.mocked(Animated.loop).mock.calls).toHaveLength(loops);
  expect(page.getAllByRole('text')).toHaveLength(1);

  page.unmount();
  const frames = jest.mocked(requestAnimationFrame).mock.calls.length;
  act(() => jest.advanceTimersByTime(10000));
  expect(jest.mocked(requestAnimationFrame).mock.calls).toHaveLength(frames);
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
  expect(Animated.loop).not.toHaveBeenCalled();

  page.rerender(progressView('正在准备资料'));
  expect(
    page.queryByTestId('processing-progress-suffix', {
      includeHiddenElements: true,
    })
  ).toBeNull();
  expect(Animated.loop).toHaveBeenCalled();
});

test('前缀更新显示新文字，卸载后旧循环与新循环均不能再调度帧', () => {
  const page = render(progressView('读取资料 · 第一份'));
  act(() => jest.advanceTimersByTime(400));
  const loops = jest.mocked(Animated.loop).mock.calls.length;
  const frames = jest.mocked(requestAnimationFrame).mock.calls.length;
  page.rerender(progressView('整理结果 · 第二份'));
  expect(jest.mocked(Animated.loop).mock.calls.length).toBeGreaterThan(loops);
  expect(page.queryByRole('text', { name: '读取资料 · 第一份' })).toBeNull();
  expect(
    page.getByRole('text', { name: '整理结果 · 第二份' })
  ).toBeOnTheScreen();
  act(() => jest.advanceTimersByTime(400));
  expect(jest.mocked(requestAnimationFrame).mock.calls.length).toBeGreaterThan(
    frames
  );
  page.unmount();
  const stopped = jest.mocked(requestAnimationFrame).mock.calls.length;
  act(() => jest.advanceTimersByTime(10000));
  expect(jest.mocked(requestAnimationFrame).mock.calls).toHaveLength(stopped);
});

test('减少动态效果切换后显示静态文字，恢复后继续流光并清理旧循环', () => {
  const page = render(progressView('正在准备资料'));
  act(() => jest.advanceTimersByTime(400));
  const frames = jest.mocked(requestAnimationFrame).mock.calls.length;
  jest.mocked(reanimated.useReducedMotion).mockReturnValue(true);
  page.rerender(progressView('正在准备资料', true));
  expect(page.getByRole('text', { name: '正在准备资料' })).toBeOnTheScreen();
  act(() => jest.advanceTimersByTime(10000));
  expect(jest.mocked(requestAnimationFrame).mock.calls).toHaveLength(frames);
  jest.mocked(reanimated.useReducedMotion).mockReturnValue(false);
  page.rerender(progressView('正在准备资料', false));
  act(() => jest.advanceTimersByTime(400));
  expect(jest.mocked(requestAnimationFrame).mock.calls.length).toBeGreaterThan(
    frames
  );
  page.unmount();
  const stopped = jest.mocked(requestAnimationFrame).mock.calls.length;
  act(() => jest.advanceTimersByTime(10000));
  expect(jest.mocked(requestAnimationFrame).mock.calls).toHaveLength(stopped);
});

test('初始减少动态效果时不启动动画，空文字不虚构进度', () => {
  jest.mocked(reanimated.useReducedMotion).mockReturnValue(true);
  const page = render(progressView('正在准备资料'));
  expect(page.getByRole('text', { name: '正在准备资料' })).toBeOnTheScreen();
  expect(Animated.loop).not.toHaveBeenCalled();
  page.rerender(progressView(''));
  expect(page.getByRole('text').props.accessibilityLabel).toBe('');
  expect(Animated.loop).not.toHaveBeenCalled();
});

test('长中文和大字号共用一个可省略的文字行，主题和字号只应用一次', () => {
  jest.mocked(reanimated.useReducedMotion).mockReturnValue(true);
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

test.each([
  [false, lightColors.foreground],
  [true, darkColors.foregroundMuted],
] as const)('前缀保持主题基础色，后缀沿用原行颜色：dark=%s', (dark, color) => {
  jest.mocked(reanimated.useReducedMotion).mockReturnValue(true);
  const prefix = '正在整理资料 ';
  const page = render(progressView(`${prefix}· 附件一`, dark));
  const prefixText = page
    .UNSAFE_getAllByType(Text)
    .find((node) => node.props.children === prefix)!;
  expect(StyleSheet.flatten(prefixText.props.style)).toMatchObject({ color });
  expect(
    page.getByTestId('processing-progress-line', {
      includeHiddenElements: true,
    })
  ).toHaveStyle({
    color: dark ? darkColors.foregroundMuted : lightColors.foregroundMuted,
  });
  expect(
    page.getByTestId('processing-progress-suffix', {
      includeHiddenElements: true,
    })
  ).toHaveTextContent('· 附件一');
});
