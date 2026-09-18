import { StyleSheet } from 'react-native';
import { fixed, radius, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: { gap: space[4] },
    frame: {
      height: 410,
      minHeight: 0,
      overflow: 'hidden',
      borderWidth: fixed.hairline,
      borderColor: colors.outline,
      borderRadius: radius.xl,
      backgroundColor: colors.surface,
    },
    list: { flex: 1, minHeight: 0, padding: space[4] },
    separator: { height: space[3] },
    controls: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: space[3],
    },
    count: { color: colors.foregroundSubtle, fontSize: type.xxs },
  });
