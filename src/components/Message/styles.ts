import { StyleSheet } from 'react-native';
import { radius, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: space[3],
      minWidth: 0,
    },
    end: { flexDirection: 'row-reverse' },
    column: {
      flex: 1,
      maxWidth: '100%',
      gap: space[1],
      alignItems: 'flex-start',
    },
    columnEnd: { alignItems: 'flex-end' },
    fullWidth: { alignSelf: 'stretch', maxWidth: '100%' },
    content: { minWidth: 0, maxWidth: '78%', gap: space[2] },
    bubble: {
      paddingHorizontal: space[5],
      paddingVertical: space[4],
      borderRadius: radius['2xl'],
      backgroundColor: colors.surface,
    },
    outgoing: { backgroundColor: colors.primary },
    outgoingText: { color: colors.onPrimary },
    outlined: {
      paddingHorizontal: space[5],
      paddingVertical: space[4],
      borderRadius: radius['2xl'],
      borderWidth: 1,
      borderColor: colors.outline,
    },
    failed: { borderWidth: 1, borderColor: colors.error },
    text: {
      fontSize: type.sm,
      lineHeight: type.sm * 1.5,
      color: colors.foreground,
    },
    name: { fontSize: type.sm, color: colors.foregroundMuted },
    status: { fontSize: type.sm, color: colors.foregroundMuted },
    errorText: { color: colors.error },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: space[1],
      marginTop: space[1],
    },
  });
