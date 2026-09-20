import { StyleSheet } from 'react-native';
import { space, type } from '@unif/react-native-design';
import type { ColorTokens } from '@unif/react-native-design';

export const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    root: { gap: space[3] },
    controls: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    note: { color: colors.foregroundMuted, fontSize: type.xs },
  });
