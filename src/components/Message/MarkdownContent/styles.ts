import { StyleSheet } from 'react-native';
import { type, space, fontMono } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

const makeMarkdownStyles = (colors: ColorTokens, outgoing: boolean) => {
  const textColor = outgoing ? colors.onPrimary : colors.foreground;
  const body = {
    fontSize: type.sm,
    lineHeight: type.sm * 1.5,
    color: textColor,
  };
  return StyleSheet.create({
    text: body,
    em: { ...body, fontStyle: 'italic' },
    strong: { ...body, fontWeight: 'bold' },
    strikethrough: { ...body, textDecorationLine: 'line-through' },
    link: {
      ...body,
      color: outgoing ? colors.onPrimary : colors.primary,
      textDecorationLine: 'underline',
    },
    li: body,
    codespan: {
      ...body,
      fontFamily: fontMono,
      color: colors.foreground,
      backgroundColor: colors.surfaceContainer,
    },
    h1: {
      fontSize: type.h1,
      lineHeight: type.h1 * 1.4,
      color: textColor,
      borderBottomColor: colors.outline,
    },
    h2: {
      fontSize: type.h2,
      lineHeight: type.h2 * 1.4,
      color: textColor,
      borderBottomColor: colors.outline,
    },
    h3: {
      fontSize: type.h3,
      lineHeight: type.h3 * 1.4,
      color: textColor,
    },
    h4: {
      fontSize: type.body,
      lineHeight: type.body * 1.4,
      color: textColor,
    },
    h5: {
      fontSize: type.sm,
      lineHeight: type.sm * 1.4,
      color: textColor,
    },
    h6: {
      fontSize: type.xs,
      lineHeight: type.xs * 1.4,
      color: textColor,
    },
    paragraph: { paddingVertical: space[1] },
    code: { padding: space[2], backgroundColor: colors.surfaceContainer },
    codeText: { ...body, color: colors.foreground, fontFamily: fontMono },
    blockquote: { borderLeftColor: colors.outline },
    hr: { borderBottomColor: colors.outline },
    table: { borderColor: colors.outline },
  });
};

export const createStyles = (colors: ColorTokens) =>
  makeMarkdownStyles(colors, false);
export const createOutgoingStyles = (colors: ColorTokens) =>
  makeMarkdownStyles(colors, true);
