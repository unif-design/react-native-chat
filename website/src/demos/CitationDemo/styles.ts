import { StyleSheet } from 'react-native';
import { fw, radius, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: { gap: space[4] },
    answer: {
      gap: space[3],
      padding: space[6],
      borderRadius: radius.xl,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    answerTitle: {
      color: colors.foreground,
      fontSize: type.body,
      fontWeight: fw.semi,
    },
    paragraph: {
      color: colors.foreground,
      fontSize: type.body,
      lineHeight: type.body * 1.7,
    },
  });
