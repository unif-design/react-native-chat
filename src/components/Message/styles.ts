import { StyleSheet } from 'react-native';
import { radius, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: space[2],
      minWidth: 0,
      paddingVertical: space[2],
    },
    end: { flexDirection: 'row-reverse' },
    column: {
      flexShrink: 1,
      maxWidth: '100%',
      gap: space[1],
      alignItems: 'flex-start',
    },
    columnEnd: { alignItems: 'flex-end' },
    fullWidth: { flex: 1, alignSelf: 'stretch' },
    content: { minWidth: 0, maxWidth: '100%', gap: space[2] },
    bubble: {
      padding: space[3],
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
    },
    outgoing: { backgroundColor: colors.primaryContainer },
    outlined: {
      padding: space[3],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    failed: { borderWidth: 1, borderColor: colors.error },
    text: { fontSize: type.body, color: colors.foreground },
    name: { fontSize: type.sm, color: colors.foregroundMuted },
    status: { fontSize: type.sm, color: colors.foregroundMuted },
    errorText: { color: colors.error },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  });
