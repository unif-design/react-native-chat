import { StyleSheet } from 'react-native';
import { radius, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: { minWidth: 0 },
    collection: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      gap: space[2],
    },
    carousel: { gap: space[2], alignItems: 'flex-start' },
    item: {
      gap: space[2],
      padding: space[2],
      borderWidth: 1,
      borderColor: colors.outline,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },
    row: { width: '100%', flexDirection: 'row', alignItems: 'center' },
    content: { minWidth: 0, flexShrink: 1, gap: space[1] },
    rowContent: { flex: 1 },
    media: {
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    imageLayer: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    placeholder: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.sm,
    },
    progress: {
      padding: space[1],
      borderRadius: radius.sm,
      backgroundColor: colors.surface,
    },
    name: { color: colors.foreground, fontSize: type.body },
    meta: { color: colors.foregroundMuted, fontSize: type.sm },
    failed: { color: colors.error },
    action: { maxWidth: '100%' },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: space[1] },
  });
