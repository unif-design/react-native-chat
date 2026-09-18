import { StyleSheet } from 'react-native';
import { space } from '@unif/react-native-design';
export const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 0, minWidth: 0 },
  list: { flex: 1 },
  returnToEnd: { position: 'absolute', bottom: space[3], alignSelf: 'center' },
});
