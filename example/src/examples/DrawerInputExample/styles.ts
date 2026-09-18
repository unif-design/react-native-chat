import { StyleSheet } from 'react-native';
import { radius, space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';
export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: { flex: 1, padding: space[3], gap: space[3] },
    modalRoot: { flex: 1 },
    modal: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: colors.scrim,
    },
    drawer: {
      maxHeight: '90%',
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      padding: space[3],
      gap: space[3],
    },
    title: { color: colors.foreground, fontSize: type.h2 },
  });
