import { StyleSheet } from 'react-native';
import { fw, icon, r, radius, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    timelineRoot: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: space[5],
    },
    timelineStep: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: space[4],
    },
    timelineGutter: {
      alignItems: 'center',
      width: icon.xs,
      alignSelf: 'stretch',
    },
    timelineLine: {
      width: r(1.5),
      flex: 1,
      backgroundColor: colors.outline,
      marginTop: r(2),
      minHeight: space[5],
    },
    timelineBody: { flex: 1 },
    timelineBodyNotLast: { paddingBottom: space[7] },
    timelineTitle: {
      flex: 1,
      fontSize: type.xs,
      fontWeight: fw.medium,
      color: colors.foreground,
      lineHeight: type.xs * 1.4,
    },
    timelineActive: { color: colors.primary },
    timelinePending: { color: colors.foregroundSubtle, fontWeight: fw.regular },
    timelineDescription: {
      flexShrink: 0,
      fontSize: type.xs,
      color: colors.foregroundSubtle,
    },
    timelineError: { color: colors.error },
    compactRoot: { gap: space[2] },
    compactSteps: { gap: space[2] },
    compactAction: { minWidth: 44, minHeight: 44 },
    compactHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      minHeight: 44,
      paddingVertical: space[1],
    },
    compactTitle: {
      flex: 1,
      minWidth: 0,
      color: colors.foregroundMuted,
      fontSize: type.xs,
      fontWeight: fw.medium,
    },
    spacer: { flex: 1 },
    compactStatus: {
      fontSize: type.xs,
      fontWeight: fw.medium,
      color: colors.foregroundMuted,
    },
    compactDescription: {
      color: colors.foregroundMuted,
      fontSize: type.xs,
      lineHeight: type.xs * 1.6,
    },
    compactDetailsContainer: {
      paddingTop: space[3],
      paddingBottom: space[2],
    },
    compactDetails: { maxHeight: r(180) },
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
