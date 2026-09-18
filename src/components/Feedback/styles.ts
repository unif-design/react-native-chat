import { StyleSheet } from 'react-native';
import { fw, radius, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: space[3],
      padding: space[4],
      borderRadius: radius.lg,
    },
    content: {
      flex: 1,
      gap: space[1],
    },
    title: {
      color: colors.foreground,
      fontSize: type.sm,
      fontWeight: fw.semi,
    },
    message: {
      color: colors.foregroundMuted,
      fontSize: type.sm,
    },
    action: {
      paddingTop: space[3],
    },
  });
