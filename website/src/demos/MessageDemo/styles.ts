import { StyleSheet } from 'react-native';
import { fw, radius, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: { gap: space[5] },
    card: { gap: space[2] },
    cardTitle: {
      color: colors.foreground,
      fontSize: type.body,
      fontWeight: fw.semi,
    },
    cardText: { color: colors.foregroundMuted, fontSize: type.sm },
    cardAction: {
      alignItems: 'flex-start',
      marginTop: space[2],
      paddingTop: space[3],
      borderTopWidth: 1,
      borderTopColor: colors.outline,
      borderRadius: radius.sm,
    },
  });
