import { StyleSheet } from 'react-native';
import type { ColorTokens, ShadowTokens } from '@unif/react-native-design';
export const createStyles = (colors: ColorTokens, shadows: ShadowTokens) =>
  StyleSheet.create({
    root: { flex: 1, minHeight: 0, minWidth: 0 },
    list: { flex: 1 },
    returnToEnd: {
      position: 'absolute',
      bottom: 0,
      alignSelf: 'center',
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    returnProgress: StyleSheet.absoluteFill,
    returnVisual: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    returnButton: {
      alignSelf: 'center',
      borderRadius: 18,
      backgroundColor: colors.surface,
      ...shadows.card,
    },
  });
