import { Pressable, Text, View } from 'react-native';
import { Icon, useThemedStyles } from '@unif/react-native-design';
import { DEFAULT_SOURCES_TITLE } from './constants';
import { createStyles } from './styles';
import type { SourceItem, SourcesProps } from './types';

export function Sources({
  items,
  title = DEFAULT_SOURCES_TITLE,
  onPress,
  style,
  testID,
}: SourcesProps): React.JSX.Element | null {
  const styles = useThemedStyles(createStyles);

  if (items.length === 0) return null;

  const renderItem = (item: SourceItem, showChevron: boolean) => (
    <>
      <Text style={styles.label} testID={`source-label-${item.id}`}>
        {item.label}
      </Text>
      <View style={styles.content}>
        {item.title ? <Text style={styles.title}>{item.title}</Text> : null}
        {item.description ? (
          <Text style={styles.description}>{item.description}</Text>
        ) : null}
      </View>
      {showChevron ? <Icon name="chevron-right" /> : null}
    </>
  );

  return (
    <View style={[styles.root, style]} testID={testID}>
      <Text style={styles.heading}>{title}</Text>
      <View style={styles.list}>
        {items.map((item) =>
          onPress ? (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.item,
                pressed && styles.pressed,
                item.disabled && styles.disabled,
              ]}
              onPress={item.disabled ? undefined : () => onPress(item)}
              disabled={item.disabled}
              accessibilityRole="button"
              accessibilityLabel={
                item.title ? `${item.label} ${item.title}` : item.label
              }
              accessibilityState={{ disabled: item.disabled === true }}
              testID={`source-${item.id}`}
            >
              {renderItem(item, true)}
            </Pressable>
          ) : (
            <View
              key={item.id}
              style={[styles.item, item.disabled && styles.disabled]}
              testID={`source-${item.id}`}
            >
              {renderItem(item, false)}
            </View>
          )
        )}
      </View>
    </View>
  );
}
