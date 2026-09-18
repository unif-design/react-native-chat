import { StyleSheet } from 'react-native';
import { fw, radius, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: {
      gap: space[1],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
      borderRadius: radius.md,
      backgroundColor: colors.surfaceContainer,
    },
    label: {
      color: colors.foregroundSubtle,
      fontSize: type.xxs,
      fontWeight: fw.medium,
    },
    value: {
      color: colors.foregroundMuted,
      fontSize: type.sm,
    },
  });
