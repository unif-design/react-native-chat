import { ImageOutlined } from '@unif/react-native-icons';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { describe, expect, jest, test } from '@jest/globals';
import {
  GlassLayer,
  Thumbnail,
  ThemeProvider,
  lightColors,
} from '@unif/react-native-design';
import { Attachments } from '..';
import type { ChatAttachmentItem, AttachmentsProps } from '..';

jest.mock('react-native/Libraries/Utilities/Dimensions', () => {
  const actual = jest.requireActual<{
    default: typeof import('react-native').Dimensions;
  }>('react-native/Libraries/Utilities/Dimensions');
  jest
    .spyOn(actual.default, 'get')
    .mockReturnValue({ width: 390, height: 844, scale: 3, fontScale: 1 });
  return actual;
});

const renderAttachments = (props: AttachmentsProps) =>
  render(<Attachments {...props} />, { wrapper: ThemeProvider });

describe('Attachments', () => {
  test('缺字段和同名附件保留，预览和移除交付原项', () => {
    const first: ChatAttachmentItem = {
      id: 'a',
      name: '商品',
      previewable: true,
      removable: true,
    };
    const second: ChatAttachmentItem = { id: 'b', name: '商品' };
    const onPreview = jest.fn();
    const onRemove = jest.fn();
    renderAttachments({
      items: [first, second, { id: 'c' }],
      onPreview,
      onRemove,
    });
    expect(screen.getAllByText('商品')).toHaveLength(2);
    expect(screen.getByText('未命名附件')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: '预览商品' }));
    expect(onPreview.mock.calls[0]?.[0]).toBe(first);
    fireEvent.press(screen.getByRole('button', { name: '移除商品' }));
    expect(onRemove.mock.calls[0]?.[0]).toBe(first);
    expect(screen.getAllByText('商品')).toHaveLength(2);
  });

  test('未提供回调保持静态，禁用和忙碌的动作不交付', () => {
    const onPress = jest.fn();
    const onRemove = jest.fn();
    const item: ChatAttachmentItem = {
      id: 'a',
      name: '附件',
      previewable: true,
      removable: true,
      removeDisabled: true,
      status: 'failed',
      actions: [
        { id: 'disabled', label: '重新准备', disabled: true, onPress },
        { id: 'busy', label: '继续处理', loading: true, onPress },
        { id: 'ready', label: '查看详情', onPress },
      ],
    };
    renderAttachments({ items: [item], onRemove });
    expect(screen.queryByRole('button', { name: '预览附件' })).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: '移除附件' }));
    fireEvent.press(screen.getByRole('button', { name: '重新准备' }));
    fireEvent.press(screen.getByRole('button', { name: '继续处理' }));
    expect(onPress).not.toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: '查看详情' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('重试')).toBeNull();
  });

  test.each([undefined, NaN, Infinity, -0.1, 1.1])(
    '非法或未知比例 %s 不生成百分比',
    (progress) => {
      renderAttachments({
        items: [{ id: 'a', status: 'uploading', progress }],
        showProgressLabel: true,
      });
      expect(screen.getByLabelText('正在上传')).toBeOnTheScreen();
      expect(screen.queryByRole('progressbar')).toBeNull();
      expect(screen.queryByText(/%/)).toBeNull();
    }
  );

  test.each(['center', 'caption'] as const)(
    '%s 只在 uploading 显示实际比例，processing 不沿用旧比例',
    (loadingVisual) => {
      const item: ChatAttachmentItem = {
        id: 'a',
        status: 'uploading',
        progress: 0.42,
        loadingVisual,
      };
      const view = renderAttachments({
        items: [item],
        showProgressLabel: true,
      });
      expect(
        screen.getByText(/42%/, { includeHiddenElements: true })
      ).toBeOnTheScreen();
      const layers = screen.UNSAFE_queryAllByType(GlassLayer);
      expect(layers).toHaveLength(loadingVisual === 'center' ? 1 : 0);
      if (loadingVisual === 'center') {
        expect(layers[0]!.props.colorScheme).toBe('dark');
        const visualStyle = StyleSheet.flatten(layers[0]!.parent!.props.style);
        expect(visualStyle.backgroundColor).toBeUndefined();
        expect(visualStyle.overflow).not.toBe('hidden');
        expect(
          screen.getByText(/42%/, { includeHiddenElements: true })
        ).toHaveStyle({ color: lightColors.onPrimary });
      }
      view.rerender(
        <Attachments
          items={[{ ...item, status: 'processing' }]}
          showProgressLabel
        />
      );
      expect(
        screen.queryByText(/42%/, { includeHiddenElements: true })
      ).toBeNull();
      expect(
        loadingVisual === 'center'
          ? screen.getByLabelText('正在处理')
          : screen.getByText('正在处理')
      ).toBeOnTheScreen();
      expect(screen.UNSAFE_queryAllByType(GlassLayer)).toHaveLength(
        loadingVisual === 'center' ? 1 : 0
      );
      view.rerender(
        <Attachments items={[{ ...item, status: 'ready' }]} showProgressLabel />
      );
      expect(screen.queryByText(/42%|正在处理|正在上传/)).toBeNull();
      expect(screen.UNSAFE_queryAllByType(GlassLayer)).toHaveLength(0);
    }
  );

  test.each(['grid', 'mixed', 'carousel', 'list', 'preview'] as const)(
    '%s 保持输入顺序与明确的图片失败占位',
    (layout) => {
      renderAttachments({
        layout,
        items: [
          {
            id: 'photo',
            name: '图片',
            kind: 'image',
            thumbnail: { uri: 'https://example.invalid/image.png' },
          },
          { id: 'file', name: '文件', kind: 'file' },
        ],
      });
      expect(
        layout === 'list'
          ? screen.getByText('图片')
          : screen.getByLabelText('图片')
      ).toBeOnTheScreen();
      expect(screen.getByText('文件')).toBeOnTheScreen();
    }
  );
});

test('根 padding 不参与内部网格宽度，真实 Thumbnail 消费实际尺寸和失败占位', () => {
  renderAttachments({
    testID: 'attachments',
    style: { padding: 16 },
    items: [
      {
        id: 'a',
        name: '图片',
        kind: 'image',
        status: 'ready',
        thumbnail: { uri: 'https://example.invalid/a.png' },
      },
    ],
  });
  fireEvent(screen.getByTestId('attachments'), 'layout', {
    nativeEvent: { layout: { width: 320, height: 250, x: 0, y: 0 } },
  });
  const collection = screen
    .getByTestId('attachments')
    .findAllByType(View)
    .find((node) => node.props.testID === 'attachments-content');
  expect(collection).toBeDefined();
  fireEvent(collection!, 'layout', {
    nativeEvent: { layout: { width: 288, height: 250, x: 16, y: 0 } },
  });
  const thumbnail = screen.UNSAFE_getByType(Thumbnail);
  expect(thumbnail.props.size.width).toBeLessThanOrEqual(288);
  const imageWidth = thumbnail.props.size.width;
  fireEvent(screen.getByTestId('attachments'), 'layout', {
    nativeEvent: { layout: { width: 400, height: 250, x: 0, y: 0 } },
  });
  expect(screen.UNSAFE_getByType(Thumbnail).props.size.width).toBe(imageWidth);
  fireEvent(screen.UNSAFE_getByType(Image), 'error', {
    nativeEvent: { error: 'image failure' },
  });
  expect(screen.UNSAFE_queryAllByType(ImageOutlined).length > 0).toBe(true);
  expect(screen.getByLabelText('图片')).toBeOnTheScreen();
  expect(screen.queryByText('处理失败')).toBeNull();
});

test.each(['image', 'file'] as const)(
  '输入预览的 %s 保留中心预览与右上移除的独立操作',
  (kind) => {
    const item: ChatAttachmentItem = {
      id: 'attachment',
      name: '清单',
      kind,
      previewable: true,
      removable: true,
    };
    const onPreview = jest.fn();
    const onRemove = jest.fn();
    renderAttachments({
      items: [item],
      layout: 'preview',
      onPreview,
      onRemove,
    });
    const tile = screen.getByLabelText('预览清单');
    const remove = screen.getByLabelText('移除清单');
    const tileStyle = StyleSheet.flatten(tile.props.style);
    const removeStyle = StyleSheet.flatten(remove.props.style);
    expect(screen.UNSAFE_getByType(ScrollView).props.horizontal).toBe(true);
    // 96 的设计尺寸在 390pt、3x 屏幕上按既有缩放对齐为 93pt。
    expect(tile).toHaveStyle({ width: 93, height: 93 });
    expect(removeStyle.left).toBeGreaterThan(tileStyle.width / 2);
    expect(removeStyle.left + removeStyle.width).toBeLessThanOrEqual(
      tileStyle.width
    );
    expect(removeStyle.width).toBeGreaterThanOrEqual(44);
    expect(removeStyle.overflow).not.toBe('hidden');
    expect(screen.UNSAFE_getByType(GlassLayer).props.colorScheme).toBe('dark');
    expect(
      StyleSheet.flatten(
        screen.UNSAFE_getByType(GlassLayer).parent!.props.style
      ).overflow
    ).toBe('hidden');
    fireEvent.press(tile);
    expect(onPreview).toHaveBeenCalledWith(item);
    expect(onRemove).not.toHaveBeenCalled();
    fireEvent.press(screen.getByLabelText('移除清单'));
    expect(onRemove).toHaveBeenCalledWith(item);
    expect(onPreview).toHaveBeenCalledTimes(1);
  }
);

test('预览布局的重试与移除命中区域不重叠，且保留原动作', () => {
  const onRetry = jest.fn();
  const onRemove = jest.fn();
  const onPreview = jest.fn();
  renderAttachments({
    layout: 'preview',
    items: [
      {
        id: 'failed-photo',
        name: '清单',
        kind: 'image',
        status: 'failed',
        removable: true,
        previewable: true,
        actions: [{ id: 'retry', label: '重新上传', onPress: onRetry }],
      },
    ],
    onRemove,
    onPreview,
  });
  const retry = screen.getByLabelText('重新上传');
  const remove = screen.getByLabelText('移除清单');
  expect(screen.UNSAFE_getByType(GlassLayer).props.colorScheme).toBe('dark');
  expect(
    StyleSheet.flatten(screen.UNSAFE_getByType(GlassLayer).parent!.props.style)
      .overflow
  ).not.toBe('hidden');
  expect(
    remove
      .findAllByType(View)
      .some(
        (node) =>
          StyleSheet.flatten(node.props.style)?.backgroundColor ===
          lightColors.error
      )
  ).toBe(true);
  const retryStyle = StyleSheet.flatten(retry.props.style);
  const removeStyle = StyleSheet.flatten(remove.props.style);
  expect(retryStyle.left + retryStyle.width).toBeLessThanOrEqual(
    removeStyle.left
  );
  expect(retryStyle.width).toBeGreaterThanOrEqual(44);
  fireEvent.press(retry);
  expect(onRetry).toHaveBeenCalledTimes(1);
  expect(onRemove).not.toHaveBeenCalled();
  expect(onPreview).not.toHaveBeenCalled();
});

test.each(['carousel', 'preview'] as const)(
  '%s 失败说明在图片下方时，整图预览与重试及移除独立且不增加眼睛入口',
  (layout) => {
    const onPreview = jest.fn();
    const onRemove = jest.fn();
    const onRetry = jest.fn();
    const item: ChatAttachmentItem = {
      id: 'failed-caption',
      name: '订货清单',
      kind: 'image',
      thumbnail: { uri: 'file:///order.jpg' },
      status: 'failed',
      statusText: '图片内容无法识别',
      loadingVisual: 'caption',
      previewable: true,
      removable: true,
      actions: [{ id: 'retry', label: '继续此附件', onPress: onRetry }],
    };
    renderAttachments({ items: [item], layout, onPreview, onRemove });
    const preview = screen.getByRole('button', { name: '预览订货清单' });
    expect(preview.findByType(Thumbnail).props.source).toEqual(item.thumbnail);
    expect(screen.getByText('图片内容无法识别')).toBeOnTheScreen();
    fireEvent.press(preview);
    expect(onPreview).toHaveBeenCalledWith(item);
    expect(onRetry).not.toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: '继续此附件' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onPreview).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByRole('button', { name: '移除订货清单' }));
    expect(onRemove).toHaveBeenCalledWith(item);
    expect(onPreview).toHaveBeenCalledTimes(1);
  }
);
