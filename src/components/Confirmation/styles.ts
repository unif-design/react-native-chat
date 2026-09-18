import { StyleSheet } from 'react-native';
import {
  fw,
  radius,
  space,
  type,
  type ColorTokens,
} from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: {
      gap: space[4],
      padding: space[5],
      borderWidth: 1,
      borderColor: colors.outline,
      borderRadius: radius.xl,
      backgroundColor: colors.surface,
    },
    title: {
      color: colors.foreground,
      fontSize: type.h3,
      fontWeight: fw.semi,
    },
    status: {
      color: colors.foregroundMuted,
      fontSize: type.sm,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: space[3],
    },
    footer: {
      paddingTop: space[2],
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.outline,
    },
  });
