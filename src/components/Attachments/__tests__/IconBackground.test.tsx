import {
  FileExcelOutlined,
  ImageOutlined,
  PlayOutlined,
  SoundOutlined,
} from '@unif/react-native-icons';
import { Image, StyleSheet } from 'react-native';
import { fireEvent, renderAsync, screen } from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import {
  ThemeProvider,
  Thumbnail,
  icon,
  radius,
} from '@unif/react-native-design';
import { Attachments } from '@unif/react-native-chat';

test.each([
  [undefined, FileExcelOutlined],
  ['file', FileExcelOutlined],
  ['image', ImageOutlined],
  ['audio', SoundOutlined],
  ['video', PlayOutlined],
] as const)(
  'kind=%s 的占位图标无底色，保留尺寸、名称及原操作',
  async (kind, Icon) => {
    const item = {
      id: 'attachment',
      name: '清单.xlsx',
      kind,
      previewable: true,
      removable: true,
    };
    const onPreview = jest.fn();
    const onRemove = jest.fn();
    await renderAsync(
      <Attachments
        items={[item]}
        layout="list"
        onPreview={onPreview}
        onRemove={onRemove}
      />,
      { wrapper: ThemeProvider }
    );
    const style = StyleSheet.flatten(
      screen.UNSAFE_getByType(Icon).parent!.props.style
    );
    expect(style.backgroundColor).toBeUndefined();
    expect(style).toMatchObject({ width: icon.xl, height: icon.xl });
    expect(screen.getByText('清单.xlsx')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: '预览清单.xlsx' }));
    expect(onPreview).toHaveBeenCalledWith(item);
    expect(onRemove).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: '移除清单.xlsx' }));
    expect(onRemove).toHaveBeenCalledWith(item);
  }
);

test.each(['image', 'video'] as const)(
  '%s 的真实缩略图继续展示媒体并保留原圆角',
  async (kind) => {
    const source = { uri: 'https://images.test/preview.jpg' };
    await renderAsync(
      <Attachments
        items={[{ id: 'media', kind, name: '媒体', thumbnail: source }]}
      />,
      { wrapper: ThemeProvider }
    );
    expect(screen.UNSAFE_getByType(Thumbnail).props.source).toEqual(source);
    expect(screen.UNSAFE_getByType(Thumbnail).props.size.borderRadius).toBe(
      radius.sm
    );
    expect(screen.UNSAFE_getByType(Image).props.source).toEqual(source);
  }
);
