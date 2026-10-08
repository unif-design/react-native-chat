import { StyleSheet } from 'react-native';
import { r, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    // 为输入框上方的操作菜单保留示例空间。
    root: { gap: space[3], paddingTop: r(200) },
    controls: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    note: { color: colors.foregroundMuted, fontSize: type.xs },
  });
