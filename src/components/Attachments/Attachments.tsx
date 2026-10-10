import { ScrollView, View } from 'react-native';
import { useThemedStyles } from '@unif/react-native-design';
import {
  CARD_WIDTH,
  MIXED_IMAGE_SIZE,
  ROW_IMAGE_SIZE,
  PREVIEW_IMAGE_SIZE,
} from './constants';
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
  const content = items.map((item) => {
    const preview = layout === 'preview';
    const size = preview ? PREVIEW_IMAGE_SIZE : CARD_WIDTH;
    const row =
      layout === 'list' || (layout === 'mixed' && item.kind !== 'image');
    return (
      <AttachmentItem
        key={item.id}
        item={item}
        row={row}
        mixed={layout === 'mixed'}
        compact={layout === 'compact' || preview}
        preview={preview}
        width={size}
        imageSize={
          row ? (layout === 'mixed' ? MIXED_IMAGE_SIZE : ROW_IMAGE_SIZE) : size
        }
        showProgressLabel={showProgressLabel}
        onPreview={onPreview}
        onRemove={onRemove}
      />
    );
  });
  return (
    <View style={[styles.root, style]} testID={testID}>
      {layout === 'carousel' || layout === 'preview' ? (
        <ScrollView
          horizontal
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {content}
        </ScrollView>
      ) : (
        <View
          testID={testID ? `${testID}-content` : undefined}
          style={styles.collection}
        >
          {content}
        </View>
      )}
    </View>
  );
}
