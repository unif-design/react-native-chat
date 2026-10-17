import { Image } from 'react-native';
import { ThemeProvider, Thumbnail } from '@unif/react-native-design';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { afterEach, expect, jest, test } from '@jest/globals';
import { MarkdownImage } from '../MarkdownContent/MarkdownImage/MarkdownImage';

afterEach(() => {
  jest.restoreAllMocks();
});

test('图片尺寸错误、失败及迟到响应不能覆盖当前资源几何', () => {
  const pending: Array<{
    success: (w: number, h: number) => void;
    failure?: (error: unknown) => void;
  }> = [];
  jest.spyOn(Image, 'getSize').mockImplementation((_uri, success, failure) => {
    pending.push({ success, failure });
  });
  const view = render(<MarkdownImage uri="https://example.invalid/one.png" />, {
    wrapper: ThemeProvider,
  });
  const image = () => screen.UNSAFE_getByType(Thumbnail);
  fireEvent(image(), 'layout', {
    nativeEvent: { layout: { width: 120, height: 100, x: 0, y: 0 } },
  });
  expect(image().props.size.height).toBe(120);
  expect(image().props.accessibilityLabel).toBe('图片');
  for (const [w, h] of [
    [Infinity, 10],
    [10, NaN],
    [0, 10],
    [10, 0],
    [-1, 10],
    [10, -1],
  ]) {
    act(() => pending[0]!.success(w!, h!));
    expect(image().props.size.height).toBe(120);
  }
  act(() => pending[0]!.failure?.(new Error('network')));
  expect(image().props.size.height).toBe(120);
  act(() => pending[0]!.success(200, 100));
  expect(image().props.size.height).toBe(60);
  view.rerender(
    <MarkdownImage uri="https://example.invalid/two.png" label="新图" />
  );
  expect(image().props.size.height).toBe(120);
  act(() => pending[0]!.success(100, 400));
  expect(image().props.size.height).toBe(120);
  act(() => pending[1]!.success(100, 200));
  expect(image().props.size.height).toBe(240);
  expect(image().props.accessibilityLabel).toBe('新图');
  view.unmount();
  act(() => pending[1]!.success(100, 300));
});
