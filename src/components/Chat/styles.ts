import { StyleSheet } from 'react-native';
import type { ColorTokens } from '@unif/react-native-design';
export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: {
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      backgroundColor: colors.background,
    },
    messages: { flex: 1, minHeight: 0, minWidth: 0 },
  });
