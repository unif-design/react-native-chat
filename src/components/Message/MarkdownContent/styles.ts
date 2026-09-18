import { StyleSheet } from 'react-native';
import { type, space, fontMono } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) => {
  const body = {
    fontSize: type.body,
    lineHeight: type.body * 1.5,
    color: colors.foreground,
  };
  return StyleSheet.create({
    text: body,
    em: { ...body, fontStyle: 'italic' },
    strong: { ...body, fontWeight: 'bold' },
    strikethrough: { ...body, textDecorationLine: 'line-through' },
    link: { ...body, color: colors.primary },
    li: body,
    codespan: {
      ...body,
      fontFamily: fontMono,
      backgroundColor: colors.surfaceContainer,
    },
    h1: {
      fontSize: type.h1,
      lineHeight: type.h1 * 1.4,
      color: colors.foreground,
      borderBottomColor: colors.outline,
    },
    h2: {
      fontSize: type.h2,
      lineHeight: type.h2 * 1.4,
      color: colors.foreground,
      borderBottomColor: colors.outline,
    },
    h3: {
      fontSize: type.h3,
      lineHeight: type.h3 * 1.4,
      color: colors.foreground,
    },
    h4: {
      fontSize: type.body,
      lineHeight: type.body * 1.4,
      color: colors.foreground,
    },
    h5: {
      fontSize: type.sm,
      lineHeight: type.sm * 1.4,
      color: colors.foreground,
    },
    h6: {
      fontSize: type.xs,
      lineHeight: type.xs * 1.4,
      color: colors.foreground,
    },
    paragraph: { paddingVertical: space[1] },
    code: { padding: space[2], backgroundColor: colors.surfaceContainer },
    blockquote: { borderLeftColor: colors.outline },
    hr: { borderBottomColor: colors.outline },
    table: { borderColor: colors.outline },
  });
};
