import {
  FileExcelOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
} from '@unif/react-native-icons';
import type { ColorTokens } from '@unif/react-native-design';
import type { ChatAttachmentItem } from './types';

/** Display metadata only: never inspect or download the attachment. */
export function resolveFileAppearance(
  item: Pick<ChatAttachmentItem, 'name' | 'mimeType'>,
  colors: ColorTokens
) {
  const mime = item.mimeType?.split(';')[0]?.trim().toLowerCase();
  const extension = item.name?.trim().split('.').pop()?.toLowerCase();
  const kind =
    mime === 'application/pdf'
      ? 'pdf'
      : mime === 'application/msword' ||
          mime ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ? 'word'
        : mime === 'application/vnd.ms-excel' ||
            mime ===
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          ? 'excel'
          : extension === 'pdf'
            ? 'pdf'
            : extension === 'doc' || extension === 'docx'
              ? 'word'
              : extension === 'xls' || extension === 'xlsx'
                ? 'excel'
                : 'file';
  if (kind === 'pdf')
    return { Icon: FilePdfOutlined, color: colors.error, label: 'PDF 文件' };
  if (kind === 'word')
    return { Icon: FileWordOutlined, color: colors.info, label: 'Word 文档' };
  if (kind === 'excel')
    return {
      Icon: FileExcelOutlined,
      color: colors.success,
      label: 'Excel 表格',
    };
  return { Icon: FileOutlined, color: colors.foregroundMuted, label: '文件' };
}
