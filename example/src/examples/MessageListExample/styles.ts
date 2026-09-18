import { StyleSheet } from 'react-native';
import { fw, radius, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: {
      gap: space[4],
      padding: space[5],
    },
    title: {
      color: colors.foreground,
      fontSize: type.h2,
      fontWeight: fw.semi,
    },
    controls: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: space[3],
    },
    status: {
      color: colors.foregroundMuted,
      fontSize: type.sm,
    },
    listFrame: {
      height: 520,
      minHeight: 0,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.outline,
      borderRadius: radius.lg,
      backgroundColor: colors.background,
    },
    list: {
      flex: 1,
      minHeight: 0,
      paddingHorizontal: space[3],
    },
    header: {
      gap: space[2],
      paddingVertical: space[3],
    },
    headerText: {
      color: colors.foregroundMuted,
      fontSize: type.sm,
    },
    separator: {
      height: space[2],
    },
    footer: {
      paddingVertical: space[3],
      color: colors.foregroundMuted,
      fontSize: type.sm,
      textAlign: 'center',
    },
  });
