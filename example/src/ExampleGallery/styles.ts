import { StyleSheet } from 'react-native';
import { space } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';
export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: { flex: 1, minHeight: 0, backgroundColor: colors.background },
    menu: { flexGrow: 0, flexShrink: 0 },
    menuContent: { flexDirection: 'row', padding: space[2], gap: space[2] },
    settings: {
      flexDirection: 'row',
      paddingHorizontal: space[2],
      gap: space[2],
    },
    content: { flex: 1, minHeight: 0 },
  });
