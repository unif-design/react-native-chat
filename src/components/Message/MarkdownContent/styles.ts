import { StyleSheet } from 'react-native';
import { type, fw } from '@unif/react-native-design';
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
    em: { color: textColor, fontStyle: 'italic' },
    strong: { color: textColor, fontWeight: 'bold' },
    strikethrough: { color: textColor, textDecorationLine: 'line-through' },
    link: {
      color: outgoing ? colors.onPrimary : colors.primary,
      textDecorationLine: 'underline',
    },
    li: { color: textColor, fontSize: type.sm },
    codespan: {
      color: colors.foreground,
      backgroundColor: colors.surfaceContainer,
    },
    h1: { fontSize: type.h2, fontWeight: fw.bold, color: textColor },
    h2: { fontSize: type.h3, fontWeight: fw.bold, color: textColor },
    h3: { fontSize: type.body, fontWeight: fw.semi, color: textColor },
    h4: { fontSize: type.sm, fontWeight: fw.semi, color: textColor },
    h5: { fontSize: type.sm, fontWeight: fw.semi, color: textColor },
    h6: { fontSize: type.sm, fontWeight: fw.semi, color: textColor },
    code: {
      backgroundColor: colors.surfaceContainer,
      borderColor: colors.outline,
      borderWidth: 1,
    },
    codeText: { color: colors.foreground },
    blockquote: { borderColor: colors.outline, borderLeftWidth: 3 },
    hr: { backgroundColor: colors.outline, height: 1 },
    table: { borderColor: colors.outline },
  });
};

export const createStyles = (colors: ColorTokens) =>
  makeMarkdownStyles(colors, false);
export const createOutgoingStyles = (colors: ColorTokens) =>
  makeMarkdownStyles(colors, true);
