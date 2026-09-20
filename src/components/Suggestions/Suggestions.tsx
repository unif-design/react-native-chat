import { View } from 'react-native';
import { Chip, Icon, useColors } from '@unif/react-native-design';
import { SUGGESTION_ICON_SIZE } from './constants';
import { styles } from './styles';
import type { SuggestionsProps } from './types';

export function Suggestions({
  items,
  onSelect,
  align = 'start',
  style,
  testID,
}: SuggestionsProps): React.JSX.Element | null {
  const colors = useColors();
  if (items.length === 0) return null;

  return (
    <View
      style={[styles.root, styles[align], style]}
      testID={testID}
      accessibilityRole="list"
    >
      {items.map((item) => (
        <Chip
          key={item.id}
          label={item.label}
          selected={item.selected}
          busy={item.loading}
          disabled={item.disabled}
          leading={
            item.icon ? (
              <Icon
                name={item.icon}
                size={SUGGESTION_ICON_SIZE}
                color={colors.primary}
              />
            ) : undefined
          }
          onPress={onSelect ? () => onSelect(item) : undefined}
        />
      ))}
    </View>
  );
}
