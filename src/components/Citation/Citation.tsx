import { Text } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { useThemedStyles } from '@unif/react-native-design';
import { createStyles } from './styles';
import type { CitationProps } from './types';

export function Citation({
  label,
  onPress,
  disabled = false,
  accessibilityLabel = `引用${label}`,
  testID,
}: CitationProps): React.JSX.Element {
  const styles = useThemedStyles(createStyles);
  const handlePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPress?.();
  };

  return (
    <Text
      style={[styles.citation, disabled && styles.disabled]}
      onPress={disabled || !onPress ? undefined : handlePress}
      accessibilityRole={onPress ? 'link' : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      suppressHighlighting={disabled || !onPress}
      testID={testID}
    >
      [{label}]
    </Text>
  );
}
