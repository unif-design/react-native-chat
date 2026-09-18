import { View } from 'react-native';
import { useThemedStyles } from '@unif/react-native-design';
import { createStyles } from './styles';
import type { ChatProps } from './types';
export function Chat({
  children,
  composer,
  header,
  footer,
  bottomInset = 0,
  style,
  testID,
}: ChatProps) {
  const styles = useThemedStyles(createStyles);
  const paddingBottom = Number.isFinite(bottomInset)
    ? Math.max(0, bottomInset)
    : 0;
  return (
    <View style={[styles.root, { paddingBottom }, style]} testID={testID}>
      {header}
      <View style={styles.messages}>{children}</View>
      {composer}
      {footer}
    </View>
  );
}
