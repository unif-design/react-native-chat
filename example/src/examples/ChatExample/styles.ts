import { StyleSheet } from 'react-native';
import { space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';
export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: { flex: 1, minHeight: 0, padding: space[3], gap: space[2] },
    input: { backgroundColor: colors.surface, padding: space[3] },
    messages: {
      flex: 1,
      backgroundColor: colors.primaryContainer,
      padding: space[3],
    },
    text: { color: colors.foreground, fontSize: type.body },
  });
