import { StyleSheet } from 'react-native';
import { fixed, fw, radius, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: { gap: space[4] },
    frame: {
      height: 480,
      minHeight: 0,
      overflow: 'hidden',
      borderWidth: fixed.hairline,
      borderColor: colors.outline,
      borderRadius: radius.xl,
      backgroundColor: colors.surface,
    },
    chat: { padding: space[4] },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingBottom: space[4],
      borderBottomWidth: fixed.hairline,
      borderBottomColor: colors.outline,
    },
    headerCopy: { gap: space[1] },
    title: {
      color: colors.foreground,
      fontSize: type.sm,
      fontWeight: fw.semi,
    },
    subtitle: { color: colors.foregroundSubtle, fontSize: type.xxs },
    separator: { height: space[3] },
    messages: {
      flex: 1,
      paddingVertical: space[5],
    },
  });
