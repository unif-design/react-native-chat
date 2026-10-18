import { StyleSheet } from 'react-native';
import { fixed, fw, radius, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: {
      gap: space[3],
    },
    heading: {
      color: colors.foreground,
      fontSize: type.sm,
      fontWeight: fw.semi,
    },
    list: {
      gap: space[2],
    },
    item: {
      minHeight: fixed.hitTarget,
      padding: space[3],
      borderRadius: radius.md,
    },
    material: { borderRadius: radius.md },
    itemContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: space[3],
    },
    label: {
      minWidth: space[7],
      color: colors.primary,
      fontSize: type.sm,
      fontWeight: fw.semi,
    },
    content: {
      flex: 1,
      gap: space[1],
    },
    title: {
      color: colors.foreground,
      fontSize: type.sm,
      fontWeight: fw.medium,
    },
    description: {
      color: colors.foregroundMuted,
      fontSize: type.xxs,
    },
  });
