import { memo } from 'react';
import { View } from 'react-native';
import type { MessageListRowProps } from './types';

function MessageListRowContent<T>({
  item,
  previous,
  index,
  nativeID,
  itemKey,
  testID,
  onItemLayout,
  renderItem,
  renderSeparator,
}: MessageListRowProps<T>) {
  return (
    <View nativeID={nativeID}>
      {index > 0 && renderSeparator ? renderSeparator(previous!, item) : null}
      <View
        testID={testID}
        onLayout={(event) =>
          onItemLayout(itemKey, index, event.nativeEvent.layout.y)
        }
      >
        {renderItem(item, index)}
      </View>
    </View>
  );
}

// extraData participates in memo's shallow comparison even though renderers
// read that external display state through their own closures.
export const MessageListRow = memo(
  MessageListRowContent
) as typeof MessageListRowContent;
