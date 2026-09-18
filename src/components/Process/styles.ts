import { StyleSheet } from 'react-native';
import { fw, radius, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: {
      gap: space[4],
      padding: space[5],
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.outline,
      backgroundColor: colors.surface,
    },
    heading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
    },
    headingTitle: {
      flex: 1,
      color: colors.foreground,
      fontSize: type.h3,
      fontWeight: fw.semi,
    },
    steps: {
      gap: space[4],
    },
    step: {
      gap: space[2],
      paddingBottom: space[4],
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.outline,
    },
    stepLast: {
      paddingBottom: 0,
      borderBottomWidth: 0,
    },
    stepHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
    },
    stepTitle: {
      flex: 1,
      color: colors.foreground,
      fontSize: type.sm,
      fontWeight: fw.medium,
    },
    status: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1],
    },
    statusText: {
      color: colors.foregroundMuted,
      fontSize: type.xxs,
    },
    description: {
      color: colors.foregroundMuted,
      fontSize: type.sm,
    },
    elapsed: {
      color: colors.foregroundSubtle,
      fontSize: type.xxs,
    },
    details: {
      padding: space[4],
      borderRadius: radius.md,
      backgroundColor: colors.surfaceContainer,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: space[3],
    },
  });
