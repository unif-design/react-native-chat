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
      padding: space[5],
      borderWidth: 2,
      borderColor: colors.outline,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
    },
    heading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      marginBottom: space[3],
    },
    body: { marginBottom: space[4] },
    cancelled: { color: colors.foregroundSubtle },
    title: {
      flex: 1,
      color: colors.foreground,
      fontSize: type.xs,
      fontWeight: fw.semi,
    },
    status: {
      color: colors.foregroundMuted,
      fontSize: type.xxs,
    },
    actions: {
      flexDirection: 'row',
      gap: space[3],
    },
    footer: {
      paddingTop: space[2],
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.outline,
    },
  });
