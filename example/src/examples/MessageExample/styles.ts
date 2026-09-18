import { StyleSheet } from 'react-native';
import { fw, radius, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    scrollContent: {
      gap: space[5],
      padding: space[5],
    },
    title: {
      color: colors.foreground,
      fontSize: type.h2,
      fontWeight: fw.semi,
    },
    controls: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: space[3],
    },
    sectionTitle: {
      color: colors.foreground,
      fontSize: type.sm,
      fontWeight: fw.semi,
    },
    customCard: {
      gap: space[3],
      padding: space[4],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.outline,
      backgroundColor: colors.surfaceContainer,
    },
    customTitle: {
      color: colors.foreground,
      fontSize: type.body,
      fontWeight: fw.semi,
    },
    customText: {
      color: colors.foregroundMuted,
      fontSize: type.sm,
    },
    result: {
      padding: space[4],
      borderRadius: radius.md,
      color: colors.foreground,
      fontSize: type.sm,
      backgroundColor: colors.surfaceContainer,
    },
  });
