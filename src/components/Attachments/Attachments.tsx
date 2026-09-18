import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { space, useThemedStyles } from '@unif/react-native-design';
import { CARD_WIDTH, ROW_IMAGE_SIZE } from './constants';
import { createStyles } from './styles';
import { AttachmentItem } from './AttachmentItem';
import type { AttachmentsProps } from './types';

export function Attachments({
  items,
  layout = 'grid',
  showProgressLabel = false,
  onPreview,
  onRemove,
  style,
  testID,
}: AttachmentsProps) {
  const styles = useThemedStyles(createStyles);
  const [availableWidth, setAvailableWidth] = useState(0);
  const columns = Math.max(
    1,
    Math.floor((availableWidth + space[2]) / (CARD_WIDTH + space[2]))
  );
  const cardWidth =
    layout === 'grid' && availableWidth > 0
      ? (availableWidth - space[2] * (columns - 1)) / columns
      : Math.min(CARD_WIDTH, availableWidth || CARD_WIDTH);
  const content = items.map((item) => {
    const row =
      layout === 'list' || (layout === 'mixed' && item.kind !== 'image');
    return (
      <AttachmentItem
        key={item.id}
        item={item}
        row={row}
        width={cardWidth}
        imageSize={
          row ? ROW_IMAGE_SIZE : Math.max(1, cardWidth - space[2] * 2 - 2)
        }
        showProgressLabel={showProgressLabel}
        onPreview={onPreview}
        onRemove={onRemove}
      />
    );
  });
  return (
    <View style={[styles.root, style]} testID={testID}>
      {layout === 'carousel' ? (
        <ScrollView
          horizontal
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.carousel}
          onLayout={({ nativeEvent: { layout: measured } }) =>
            setAvailableWidth(measured.width)
          }
        >
          {content}
        </ScrollView>
      ) : (
        <View
          testID={testID ? `${testID}-content` : undefined}
          style={styles.collection}
          onLayout={({ nativeEvent: { layout: measured } }) =>
            setAvailableWidth(measured.width)
          }
        >
          {content}
        </View>
      )}
    </View>
  );
}
