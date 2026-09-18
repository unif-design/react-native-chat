import { StyleSheet } from 'react-native';
import { space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: { gap: space[4] },
    details: { color: colors.foregroundMuted, fontSize: type.sm },
  });
