import { describe, expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import {
  FileWordOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileOutlined,
} from '@unif/react-native-icons';
import {
  ThemeProvider,
  Thumbnail,
  lightColors,
} from '@unif/react-native-design';
import { Attachments } from '..';
import { resolveFileAppearance } from '../resolveFileAppearance';

describe('typed attachments', () => {
  test.each([
    ['report.DOCX', FileWordOutlined, 'Word 文档'],
    ['orders.xls', FileExcelOutlined, 'Excel 表格'],
    ['guide.pdf', FilePdfOutlined, 'PDF 文件'],
    ['archive.zip', FileOutlined, '文件'],
  ])(
    '%s keeps its document identity in mixed message rows',
    (name, Icon, label) => {
      render(
        <Attachments
          layout="mixed"
          items={[{ id: 'file', kind: 'file', name }]}
        />,
        { wrapper: ThemeProvider }
      );
      expect(screen.UNSAFE_getAllByType(Icon)).toHaveLength(1);
      expect(screen.getByText(label)).toBeOnTheScreen();
    }
  );
  test('recognized MIME takes precedence over a contradictory extension', () => {
    expect(
      resolveFileAppearance(
        { name: 'wrong.pdf', mimeType: 'application/msword' },
        lightColors
      ).Icon
    ).toBe(FileWordOutlined);
    expect(
      resolveFileAppearance(
        { name: 'document', mimeType: 'application/pdf; charset=UTF-8' },
        lightColors
      ).Icon
    ).toBe(FilePdfOutlined);
  });
  test('images keep a direct thumbnail and do not become document cards', () => {
    const source = { uri: 'https://example.test/photo.jpg' };
    render(
      <Attachments
        layout="mixed"
        items={[
          { id: 'image', kind: 'image', name: 'photo.jpg', thumbnail: source },
        ]}
      />,
      { wrapper: ThemeProvider }
    );
    expect(screen.UNSAFE_getByType(Thumbnail).props.source).toEqual(source);
    expect(screen.queryByText('文件')).toBeNull();
  });
});

test.each([
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])('Excel MIME %s 优先于矛盾扩展名', (mimeType) => {
  expect(
    resolveFileAppearance({ name: 'wrong.pdf', mimeType }, lightColors)
  ).toEqual({
    Icon: FileExcelOutlined,
    color: lightColors.success,
    label: 'Excel 表格',
  });
});
