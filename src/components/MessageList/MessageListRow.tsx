import { memo } from 'react';
import { View } from 'react-native';
import type { MessageListProps } from './types';

interface MessageListRowProps<T> extends Pick<
  MessageListProps<T>,
  'renderItem' | 'renderSeparator' | 'extraData'
> {
  item: T;
  previous: T | undefined;
  index: number;
  nativeID: string;
}

function MessageListRowContent<T>({
  item,
  previous,
  index,
  nativeID,
  renderItem,
  renderSeparator,
}: MessageListRowProps<T>) {
  return (
    <View nativeID={nativeID}>
      {index > 0 && renderSeparator ? renderSeparator(previous!, item) : null}
      {renderItem(item, index)}
    </View>
  );
}

// extraData participates in memo's shallow comparison even though renderers
// read that external display state through their own closures.
export const MessageListRow = memo(
  MessageListRowContent
) as typeof MessageListRowContent;
