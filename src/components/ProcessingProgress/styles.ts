import { StyleSheet } from 'react-native';
import { r, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: {
      minWidth: 0,
      paddingHorizontal: space[4],
      paddingVertical: space[3],
    },
    text: {
      color: colors.foregroundMuted,
      fontSize: type.xs,
      lineHeight: r(20),
    },
  });
