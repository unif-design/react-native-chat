import { Image, StyleSheet } from 'react-native';
import { Renderer } from 'react-native-marked';
import { ThemeProvider, type as typography } from '@unif/react-native-design';
import { render, screen } from '@testing-library/react-native';
import { afterEach, expect, jest, test } from '@jest/globals';
import { MarkdownContent } from '../MarkdownContent/MarkdownContent';

afterEach(() => {
  jest.restoreAllMocks();
});

test('列表适配保留空项、默认起点、传入样式和上游空结果', () => {
  const upstream = jest.spyOn(Renderer.prototype, 'list');
  const page = render(<MarkdownContent text="1. 初始化" />, {
    wrapper: ThemeProvider,
  });
  const renderer = upstream.mock.contexts[0];
  if (!(renderer instanceof Renderer))
    throw new Error('Expected a Markdown renderer');
  expect(renderer.list(true, [])).toEqual([]);

  page.rerender(
    <>
      {renderer.list(
        true,
        [null],
        { marginRight: 12 },
        { fontSize: 22, color: '#123456' }
      )}
    </>
  );
  const marker = screen.getByTestId('marker-box');
  expect(marker.props.children).toBe('1.\u00a0');
  expect(marker).toHaveStyle({ fontSize: 22, color: '#123456' });
  expect(StyleSheet.flatten(marker.parent?.parent?.props.style)).toEqual({
    marginRight: 12,
  });

  upstream.mockReturnValueOnce(null);
  page.rerender(<>{renderer.list(true, [null])}</>);
  expect(screen.queryByTestId('marker-box')).toBeNull();
});

test.each([
  [1, 9],
  [8, 2],
  [98, 2],
  [998, 2],
  [99999998, 2],
])('从 %i 开始的列表追加到 %i 项之后不改变已有编号宽度', (start, count) => {
  const text = Array.from(
    { length: count },
    (_, index) => `${start + index}. 第 ${index + 1} 项已有正文`
  ).join('\n');
  const page = render(<MarkdownContent text={text} />, {
    wrapper: ThemeProvider,
  });
  const markers = screen.getAllByTestId('marker-box');
  const widths = markers.map(
    (marker) => StyleSheet.flatten(marker.props.style).width
  );

  page.rerender(
    <MarkdownContent text={`${text}\n${start + count}. 新增正文`} />
  );

  const updated = screen.getAllByTestId('marker-box');
  expect(
    updated
      .slice(0, count)
      .map((marker) => StyleSheet.flatten(marker.props.style).width)
  ).toEqual(widths);
  expect(updated.at(-1)?.props.children).toBe(`${start + count}.\u00a0`);
  expect(screen.getByText('第 1 项已有正文')).toBeOnTheScreen();
});

test('流式追加列表项保留已有图片节点与资源测量', () => {
  const getSize = jest.spyOn(Image, 'getSize').mockImplementation(() => {});
  const text = '8. ![已有图片](https://example.invalid/list.png)\n9. 已有正文';
  const page = render(<MarkdownContent text={text} />, {
    wrapper: ThemeProvider,
  });
  const image = screen.getByLabelText('已有图片');
  expect(getSize).toHaveBeenCalledTimes(1);

  page.rerender(<MarkdownContent text={`${text}\n10. 新增正文`} />);

  expect(screen.getByLabelText('已有图片') === image).toBe(true);
  expect(getSize).toHaveBeenCalledTimes(1);
});

test('嵌套列表追加编号不重建父项中的图片', () => {
  const getSize = jest.spyOn(Image, 'getSize').mockImplementation(() => {});
  const text =
    '1. ![父项图片](https://example.invalid/parent.png)\n   8. 内层已有正文\n   9. 内层已有末项';
  const page = render(<MarkdownContent text={text} />, {
    wrapper: ThemeProvider,
  });
  const image = screen.getByLabelText('父项图片');
  const widths = screen
    .getAllByTestId('marker-box')
    .map((marker) => StyleSheet.flatten(marker.props.style).width);

  page.rerender(<MarkdownContent text={`${text}\n   10. 内层追加正文`} />);

  expect(
    screen
      .getAllByTestId('marker-box')
      .slice(0, 3)
      .map((marker) => StyleSheet.flatten(marker.props.style).width)
  ).toEqual(widths);
  expect(screen.getByLabelText('父项图片') === image).toBe(true);
  expect(getSize).toHaveBeenCalledTimes(1);
});

test('同一消息中的独立列表各自保持编号和节点，前后正文块没有 key 冲突', () => {
  const getSize = jest.spyOn(Image, 'getSize').mockImplementation(() => {});
  const consoleError = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});
  const text =
    '8. ![首组图片](https://example.invalid/first.png)\n9. 首组末项\n\n中间段落\n\n98. ![次组图片](https://example.invalid/second.png)\n99. 次组末项';
  const page = render(<MarkdownContent text={text} />, {
    wrapper: ThemeProvider,
  });
  const firstImage = screen.getByLabelText('首组图片');
  const secondImage = screen.getByLabelText('次组图片');
  const next = `${text}\n100. 次组新增项\n\n尾部段落`;

  page.rerender(<MarkdownContent text={next} />);

  expect(screen.getByLabelText('首组图片') === firstImage).toBe(true);
  expect(screen.getByLabelText('次组图片') === secondImage).toBe(true);
  expect(getSize).toHaveBeenCalledTimes(2);
  expect(
    screen.getAllByTestId('marker-box').map((marker) => marker.props.children)
  ).toEqual(['8.\u00a0', '9.\u00a0', '98.\u00a0', '99.\u00a0', '100.\u00a0']);
  expect(screen.getByText('尾部段落')).toBeOnTheScreen();

  page.rerender(<MarkdownContent text={`前部段落\n\n${next}`} />);

  expect(screen.getByText('前部段落')).toBeOnTheScreen();
  expect(screen.getAllByLabelText('首组图片')).toHaveLength(1);
  expect(screen.getAllByLabelText('次组图片')).toHaveLength(1);
  expect(consoleError).not.toHaveBeenCalled();
});

test.each(['light', 'dark'] as const)(
  '%s 主题的大字号保留完整起始编号、嵌套和无序列表',
  (scheme) => {
    render(
      <ThemeProvider forceScheme={scheme} fontScale={2}>
        <MarkdownContent
          text={
            '0. 外层零号\n   8. 内层八号\n   9. 内层九号\n   10. 内层十号\n1. 外层一号\n\n- 无序正文'
          }
        />
      </ThemeProvider>
    );
    const markers = screen.getAllByTestId('marker-box');
    expect(markers.map((marker) => marker.props.children)).toEqual([
      '0.\u00a0',
      '8.\u00a0',
      '9.\u00a0',
      '10.\u00a0',
      '1.\u00a0',
      '•\u00a0',
    ]);
    for (const marker of markers) {
      expect(marker).toHaveStyle({ fontSize: typography.sm * 2 });
      expect(marker.props.numberOfLines).toBeUndefined();
      expect(marker.props.accessible).not.toBe(false);
    }
    expect(screen.getByText('内层十号')).toHaveStyle({
      fontSize: typography.sm * 2,
    });
    expect(screen.getByText('无序正文')).toBeOnTheScreen();
  }
);
