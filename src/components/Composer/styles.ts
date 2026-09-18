import { StyleSheet } from 'react-native';
import { radius, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: { gap: space[2], minWidth: 0 },
    card: {
      padding: space[3],
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
    },
    regular: { gap: space[2] },
    hidden: { display: 'none' },
    toolbar: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: space[2],
    },
    primary: { marginStart: 'auto' },
    menu: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    voice: { gap: space[3] },
    transcript: { color: colors.foreground, fontSize: type.body },
  });
