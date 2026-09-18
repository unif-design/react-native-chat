import { StyleSheet } from 'react-native';
import { space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';
export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: space[5],
      gap: space[3],
      backgroundColor: colors.background,
    },
    title: { color: colors.foreground, fontSize: type.h1 },
    description: { color: colors.foregroundMuted, fontSize: type.body },
  });
