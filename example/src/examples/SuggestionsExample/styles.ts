import { StyleSheet } from 'react-native';
import { space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: { gap: space[4], padding: space[5] },
    title: { color: colors.foreground, fontSize: type.h2 },
    result: { color: colors.foregroundMuted, fontSize: type.sm },
  });
