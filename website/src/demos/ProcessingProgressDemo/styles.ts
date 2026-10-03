import { StyleSheet } from 'react-native';
import { space } from '@unif/react-native-design';

export const styles = StyleSheet.create({
  root: { gap: space[3], minWidth: 0 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
});
