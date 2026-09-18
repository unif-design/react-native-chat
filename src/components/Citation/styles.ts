import { StyleSheet } from 'react-native';
import { fw, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    citation: {
      color: colors.primary,
      fontSize: type.xxs,
      fontWeight: fw.semi,
    },
    disabled: {
      color: colors.foregroundSubtle,
    },
  });
