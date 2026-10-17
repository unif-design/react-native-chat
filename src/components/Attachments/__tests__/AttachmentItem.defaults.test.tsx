import { render, screen } from '@testing-library/react-native';
import { expect, test } from '@jest/globals';
import { ThemeProvider } from '@unif/react-native-design';
import { AttachmentItem } from '../AttachmentItem';

test('独立附件项的缺省参数保留文件名称和状态，不创建操作', () => {
  render(
    <AttachmentItem
      item={{ id: 'document', name: '清单.pdf', kind: 'file' }}
      imageSize={44}
      row
      width={120}
    />,
    { wrapper: ThemeProvider }
  );
  expect(screen.getByText('清单.pdf')).toBeOnTheScreen();
  expect(screen.queryByRole('button')).toBeNull();
});
