import { Text, View } from 'react-native';
import { useThemedStyles } from '@unif/react-native-design';
import { DEFAULT_RESULT_LABEL } from './constants';
import { createStyles } from './styles';
import type { DemoResultProps } from './types';

export function DemoResult({
  children,
  label = DEFAULT_RESULT_LABEL,
}: DemoResultProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.root} accessibilityLiveRegion="polite">
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{children}</Text>
    </View>
  );
}
