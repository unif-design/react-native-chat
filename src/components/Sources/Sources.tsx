import { ChevronRightOutlined } from '@unif/react-native-icons';
import { Pressable, Text, View } from 'react-native';
import {
  GlassLayer,
  pressedOpacity,
  r,
  useColors,
  useThemedStyles,
} from '@unif/react-native-design';
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
  const colors = useColors();

  if (items.length === 0) return null;

  const renderItem = (
    item: SourceItem,
    showChevron: boolean,
    opacity: number
  ) => (
    <>
      <GlassLayer style={styles.material} />
      <View style={[styles.itemContent, { opacity }]}>
        <Text style={styles.label} testID={`source-label-${item.id}`}>
          {item.label}
        </Text>
        <View style={styles.content}>
          {item.title ? <Text style={styles.title}>{item.title}</Text> : null}
          {item.description ? (
            <Text style={styles.description}>{item.description}</Text>
          ) : null}
        </View>
        {showChevron ? (
          <ChevronRightOutlined size={r(18)} color={colors.foregroundMuted} />
        ) : null}
      </View>
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
              style={styles.item}
              onPress={item.disabled ? undefined : () => onPress(item)}
              disabled={item.disabled}
              accessibilityRole="button"
              accessibilityLabel={
                item.title ? `${item.label} ${item.title}` : item.label
              }
              accessibilityState={{ disabled: item.disabled === true }}
              testID={`source-${item.id}`}
            >
              {({ pressed }) =>
                renderItem(
                  item,
                  true,
                  item.disabled ? 0.5 : pressed ? pressedOpacity : 1
                )
              }
            </Pressable>
          ) : (
            <View
              key={item.id}
              style={styles.item}
              testID={`source-${item.id}`}
            >
              {renderItem(item, false, item.disabled ? 0.5 : 1)}
            </View>
          )
        )}
      </View>
    </View>
  );
}
