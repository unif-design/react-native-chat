import { Image, Linking } from 'react-native';
import { SvgFromXml } from 'react-native-svg';
import { ThemeProvider } from '@unif/react-native-design';
import { Message } from '@unif/react-native-chat';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { afterEach, expect, jest, test } from '@jest/globals';

const svgUri = 'https://example.invalid/diagram.svg';
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40" viewBox="0 0 80 40"><path d="M0 0L80 40" /></svg>';

afterEach(() => {
  jest.restoreAllMocks();
});

test('Markdown SVG 保留真实渲染器的矢量图片路径，流式更新不重新加载', async () => {
  const fetchSvg = jest
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async () => new Response(svg, { status: 200 }));
  const getSize = jest.spyOn(Image, 'getSize').mockImplementation(() => {});
  const view = render(
    <Message format="markdown" text={`![示意图](${svgUri})`} />,
    {
      wrapper: ThemeProvider,
    }
  );
  await act(async () => {});

  expect(screen.UNSAFE_getByType(SvgFromXml).props.xml).toBe(svg);
  expect(screen.UNSAFE_getByType(SvgFromXml).props.accessibilityLabel).toBe(
    '示意图'
  );
  expect(screen.getByTestId('react-native-marked-md-svg')).toBeOnTheScreen();
  expect(fetchSvg).toHaveBeenCalledWith(svgUri);
  expect(getSize).not.toHaveBeenCalled();

  view.rerender(
    <Message format="markdown" text={`![示意图](${svgUri})\n\n后续正文`} />
  );
  await act(async () => {});
  expect(fetchSvg).toHaveBeenCalledTimes(1);
});

test.each([
  [`![替代文本](${svgUri} "图片标题")`, '替代文本'],
  [`![](${svgUri} "图片标题")`, '图片标题'],
  [`![](${svgUri})`, 'image'],
])('SVG 图片 %s 使用原文标签并保留上游默认值', async (text, label) => {
  jest
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async () => new Response(svg, { status: 200 }));
  render(<Message format="markdown" text={text} />, {
    wrapper: ThemeProvider,
  });
  await act(async () => {});

  expect(screen.UNSAFE_getByType(SvgFromXml).props.accessibilityLabel).toBe(
    label
  );
});

test('SVG 图片链接只交付调用方事件，未提供回调时保持静态', async () => {
  jest
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async () => new Response(svg, { status: 200 }));
  jest.spyOn(Image, 'getSize').mockImplementation(() => {});
  const openURL = jest.spyOn(Linking, 'openURL');
  const onLinkPress = jest.fn();
  const onMessagePress = jest.fn();
  const href = 'https://example.invalid/details?view=diagram#image';
  const text = `[![查看示意图](${svgUri})](${href})`;
  const view = render(
    <Message
      format="markdown"
      text={text}
      onLinkPress={onLinkPress}
      onPress={onMessagePress}
    />,
    { wrapper: ThemeProvider }
  );
  await act(async () => {});

  expect(screen.UNSAFE_getByType(SvgFromXml).props.xml).toBe(svg);
  const stopPropagation = jest.fn();
  fireEvent.press(screen.getByRole('link', { name: '查看示意图' }), {
    stopPropagation,
  });
  expect(onLinkPress).toHaveBeenCalledTimes(1);
  expect(onLinkPress).toHaveBeenCalledWith(href);
  expect(stopPropagation).toHaveBeenCalledTimes(1);
  expect(onMessagePress).not.toHaveBeenCalled();
  expect(openURL).not.toHaveBeenCalled();

  view.rerender(<Message format="markdown" text={text} />);
  await act(async () => {});
  expect(screen.queryByRole('link')).toBeNull();
  expect(screen.UNSAFE_getByType(SvgFromXml).props.xml).toBe(svg);
  expect(openURL).not.toHaveBeenCalled();
});

test.each([
  'https://example.invalid/diagram.svg?version=2',
  'https://example.invalid/diagram.svg#symbol',
])('图片 URI %s 保留上游的后缀识别和完整地址', (uri) => {
  const fetchSvg = jest
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async () => new Response(svg, { status: 200 }));
  const getSize = jest.spyOn(Image, 'getSize').mockImplementation(() => {});
  render(<Message format="markdown" text={`![图片](${uri})`} />, {
    wrapper: ThemeProvider,
  });

  expect(screen.UNSAFE_queryByType(SvgFromXml)).toBeNull();
  expect(screen.UNSAFE_getByType(Image).props.source).toEqual({ uri });
  expect(getSize).toHaveBeenCalledWith(
    uri,
    expect.any(Function),
    expect.any(Function)
  );
  expect(fetchSvg).not.toHaveBeenCalled();
});
