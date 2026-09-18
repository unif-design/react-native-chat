import { StyleSheet } from 'react-native';
import { fw, radius, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: { gap: space[4] },
    summary: {
      gap: space[1],
      padding: space[4],
      borderRadius: radius.md,
      backgroundColor: colors.surfaceContainer,
    },
    summaryTitle: {
      color: colors.foreground,
      fontSize: type.sm,
      fontWeight: fw.semi,
    },
    summaryText: { color: colors.foregroundMuted, fontSize: type.xxs },
    reset: { alignItems: 'flex-start' },
  });
