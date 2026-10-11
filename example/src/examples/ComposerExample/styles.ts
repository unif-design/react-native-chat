import { StyleSheet } from 'react-native';
import { fw, r, radius, space, type } from '@unif/react-native-design';
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
    plainHost: {
      borderRadius: r(20),
      backgroundColor: colors.surfaceContainer,
    },
    section: {
      gap: space[3],
      padding: space[4],
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceContainer,
    },
    sectionTitle: {
      color: colors.foreground,
      fontSize: type.sm,
      fontWeight: fw.semi,
    },
    controls: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: space[3],
    },
    note: {
      color: colors.foregroundMuted,
      fontSize: type.sm,
    },
    result: {
      color: colors.foreground,
      fontSize: type.sm,
    },
  });
