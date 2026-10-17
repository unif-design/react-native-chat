import { Image } from 'react-native';
import { Renderer } from 'react-native-marked';
import { ThemeProvider } from '@unif/react-native-design';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { afterEach, expect, jest, test } from '@jest/globals';
import { MarkdownContent } from '../MarkdownContent/MarkdownContent';

afterEach(() => {
  jest.restoreAllMocks();
});

test('嵌套格式链接和无替代文字的位图仍交付原地址', () => {
  jest.spyOn(Image, 'getSize').mockImplementation(() => {});
  const onLinkPress = jest.fn();
  render(
    <MarkdownContent
      text={
        '[**资料**](https://example.invalid/info)\n\n[![](https://example.invalid/a.png "图片标题")](https://example.invalid/a)\n\n[![](https://example.invalid/b.png)](https://example.invalid/b)'
      }
      onLinkPress={onLinkPress}
    />,
    { wrapper: ThemeProvider }
  );
  const links = screen.getAllByRole('link');
  expect(links).toHaveLength(3);
  for (const link of links)
    fireEvent.press(link, { stopPropagation: jest.fn() });
  expect(onLinkPress.mock.calls).toEqual([
    ['https://example.invalid/info'],
    ['https://example.invalid/a'],
    ['https://example.invalid/b'],
  ]);
  expect(screen.getByRole('link', { name: '图片标题' })).toBeOnTheScreen();
  expect(screen.getByRole('link', { name: '图片链接' })).toBeOnTheScreen();
});

test('上游SVG渲染器没有节点时保留空结果', () => {
  jest.spyOn(Renderer.prototype, 'image').mockReturnValue(null);
  render(<MarkdownContent text="![](https://example.invalid/empty.svg)" />, {
    wrapper: ThemeProvider,
  });
  expect(screen.UNSAFE_queryByType(Image)).toBeNull();
});
