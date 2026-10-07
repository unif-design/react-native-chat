import { expect, it, jest } from '@jest/globals';
import { Image, Text, StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider, Thumbnail, r } from '@unif/react-native-design';
import { Attachments } from '..';

it('图片以76缩略图展示，预览点击原图，不额外生成文件名卡片', () => {
  const photo = {
    id: 'photo',
    name: '门店.jpg',
    kind: 'image' as const,
    status: 'ready' as const,
    thumbnail: { uri: 'https://example.invalid/shop.jpg' },
    previewable: true,
  };
  const onPreview = jest.fn();
  render(<Attachments items={[photo]} onPreview={onPreview} />, {
    wrapper: ThemeProvider,
  });
  expect(screen.UNSAFE_getByType(Thumbnail).props.size).toMatchObject({
    width: r(76),
    height: r(76),
  });
  expect(screen.queryByText('门店.jpg')).toBeNull();
  const preview = screen.getByRole('button', { name: '预览门店.jpg' });
  expect(preview).toHaveStyle({ width: r(76), height: r(76) });
  fireEvent.press(preview);
  expect(onPreview).toHaveBeenCalledWith(photo);
  fireEvent(screen.UNSAFE_getByType(Image), 'error', {
    nativeEvent: { error: 'failed' },
  });
  expect(
    screen.getByRole('button', { name: '预览门店.jpg' })
  ).toBeOnTheScreen();
  expect(screen.queryByText('处理失败')).toBeNull();
});

it('图片移除目标与整图预览不重叠，两个动作各交付原项', () => {
  const photo = {
    id: 'photo',
    name: '门店.jpg',
    kind: 'image' as const,
    previewable: true,
    removable: true,
  };
  const onPreview = jest.fn();
  const onRemove = jest.fn();
  render(
    <Attachments items={[photo]} onPreview={onPreview} onRemove={onRemove} />,
    {
      wrapper: ThemeProvider,
    }
  );
  const preview = screen.getByRole('button', { name: '预览门店.jpg' });
  const remove = screen.getByRole('button', { name: '移除门店.jpg' });
  expect(preview).toHaveStyle({ width: r(76), height: r(76) });
  expect(remove).toHaveStyle({ left: r(76), width: 44, height: 44 });
  fireEvent.press(remove);
  expect(onRemove).toHaveBeenCalledWith(photo);
  expect(onPreview).not.toHaveBeenCalled();
  fireEvent.press(preview);
  expect(onPreview).toHaveBeenCalledWith(photo);
});

it('mixed文件行保持名称和元信息，图像和文档保持原顺序', () => {
  render(
    <Attachments
      layout="mixed"
      items={[
        { id: 'photo', name: '门店.jpg', kind: 'image' },
        { id: 'file', name: '报价单.pdf', kind: 'file', meta: 'PDF · 12 KB' },
      ]}
    />,
    { wrapper: ThemeProvider }
  );
  expect(screen.queryByText('门店.jpg')).toBeNull();
  const name = screen.getByText('报价单.pdf');
  expect(name).toBeOnTheScreen();
  expect(screen.getByText('PDF · 12 KB')).toBeOnTheScreen();
  let row = name.parent;
  while (row && StyleSheet.flatten(row.props.style)?.width !== '100%')
    row = row.parent;
  expect(row).not.toBeNull();
  expect(row!).toHaveStyle({
    width: '100%',
    flexDirection: 'row',
    height: r(64),
  });
  expect(
    screen
      .UNSAFE_getAllByType(Text)
      .filter((n) => n.props.children === '报价单.pdf')
  ).toHaveLength(1);
});

it('文档行点击名称交付预览，移除动作独立且不派发预览', () => {
  const file = {
    id: 'file',
    name: '报价单.pdf',
    kind: 'file' as const,
    previewable: true,
    removable: true,
  };
  const preview = jest.fn();
  const remove = jest.fn();
  render(
    <Attachments
      layout="mixed"
      items={[file]}
      onPreview={preview}
      onRemove={remove}
    />,
    { wrapper: ThemeProvider }
  );
  fireEvent.press(screen.getByText('报价单.pdf'));
  expect(preview).toHaveBeenCalledWith(file);
  preview.mockClear();
  fireEvent.press(screen.getByRole('button', { name: '移除报价单.pdf' }));
  expect(remove).toHaveBeenCalledWith(file);
  expect(preview).not.toHaveBeenCalled();
});

it.each(['grid', 'mixed', 'list'] as const)(
  '%s 的 caption 失败保留唯一重试动作',
  (layout) => {
    const retry = jest.fn();
    render(
      <Attachments
        layout={layout}
        items={[
          {
            id: 'failed',
            name: '附件',
            kind: 'file',
            status: 'failed',
            loadingVisual: 'caption',
            actions: [{ id: 'retry', label: '重试原附件', onPress: retry }],
          },
        ]}
      />,
      { wrapper: ThemeProvider }
    );
    fireEvent.press(screen.getByRole('button', { name: '重试原附件' }));
    expect(retry).toHaveBeenCalledTimes(1);
  }
);

it.each(['grid', 'mixed', 'carousel', 'list'] as const)(
  '%s 的处理状态不覆盖明确的本地预览权限',
  (layout) => {
    const preview = jest.fn();
    const retry = jest.fn();
    const remove = jest.fn();
    const item = {
      id: 'local',
      kind: 'image' as const,
      name: '本地照片',
      status: 'failed' as const,
      thumbnail: { uri: 'file:///photo.jpg' },
      previewable: true,
      removable: true,
      actions: [{ id: 'retry', label: '重试原照片', onPress: retry }],
    };
    const view = render(
      <Attachments
        layout={layout}
        items={[item]}
        onPreview={preview}
        onRemove={remove}
      />,
      { wrapper: ThemeProvider }
    );
    fireEvent.press(screen.getByRole('button', { name: '预览本地照片' }));
    expect(preview).toHaveBeenCalledWith(item);
    expect(retry).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: '重试原照片' }));
    expect(retry).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByRole('button', { name: '移除本地照片' }));
    expect(remove).toHaveBeenCalledWith(item);
    view.rerender(
      <Attachments
        layout={layout}
        items={[{ ...item, status: 'processing', actions: undefined }]}
        onPreview={preview}
      />
    );
    fireEvent.press(screen.getByRole('button', { name: '预览本地照片' }));
    expect(preview).toHaveBeenCalledTimes(2);
  }
);

it('单个普通动作保留自身文案，不被猜测为失败重试', () => {
  const details = jest.fn();
  render(
    <Attachments
      items={[
        {
          id: 'file',
          status: 'failed',
          actions: [{ id: 'details', label: '查看错误详情', onPress: details }],
        },
      ]}
    />,
    { wrapper: ThemeProvider }
  );
  expect(screen.getByText('查看错误详情')).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: '查看错误详情' }));
  expect(details).toHaveBeenCalledTimes(1);
});
