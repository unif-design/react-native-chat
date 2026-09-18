import { Text, View } from 'react-native';
import {
  BorderBeam,
  Button,
  CircularProgress,
  Icon,
  IconButton,
  radius,
  Spinner,
  useThemedStyles,
} from '@unif/react-native-design';
import { ATTACHMENT_ICONS, STATUS_LABELS } from './constants';
import { createStyles } from './styles';
import { Thumbnail } from '@unif/react-native-design';
import type { AttachmentItemProps } from './types';

export function AttachmentItem({
  item,
  width,
  imageSize,
  row,
  showProgressLabel = false,
  onPreview,
  onRemove,
}: AttachmentItemProps) {
  const styles = useThemedStyles(createStyles);
  const name = item.name || '未命名附件';
  const status = item.status ?? 'idle';
  const loadingVisual = item.loadingVisual ?? 'center';
  const busy = status === 'uploading' || status === 'processing';
  const progress =
    status === 'uploading' &&
    typeof item.progress === 'number' &&
    Number.isFinite(item.progress) &&
    item.progress >= 0 &&
    item.progress <= 1
      ? item.progress
      : undefined;
  const statusText = item.statusText ?? STATUS_LABELS[status];
  const icon = <Icon name={ATTACHMENT_ICONS[item.kind ?? 'file']} size={28} />;
  const media = (
    <View style={[styles.media, { minWidth: imageSize, minHeight: imageSize }]}>
      <View pointerEvents="none" style={styles.imageLayer}>
        {item.thumbnail ? (
          <Thumbnail
            source={item.thumbnail}
            size={{
              width: imageSize,
              height: imageSize,
              borderRadius: radius.sm,
            }}
            fallback={icon}
          />
        ) : (
          <View
            style={[
              styles.media,
              styles.placeholder,
              { width: imageSize, height: imageSize },
            ]}
          >
            {icon}
          </View>
        )}
      </View>
      {busy && loadingVisual === 'center' ? (
        <View pointerEvents="none" style={styles.progress}>
          {progress !== undefined ? (
            <CircularProgress
              value={progress}
              showLabel={showProgressLabel}
              accessibilityLabel={`${name}上传进度`}
            />
          ) : (
            <Spinner />
          )}
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.item, row ? styles.row : { width }]}>
      {busy && loadingVisual === 'border' ? (
        <BorderBeam>{media}</BorderBeam>
      ) : (
        media
      )}
      <View style={[styles.content, row && styles.rowContent]}>
        <Text style={styles.name}>{name}</Text>
        {item.meta ? <Text style={styles.meta}>{item.meta}</Text> : null}
        {statusText ? (
          <Text
            style={[styles.meta, status === 'failed' && styles.failed]}
            accessibilityLiveRegion="polite"
          >
            {statusText}
          </Text>
        ) : null}
        {busy &&
        loadingVisual !== 'center' &&
        showProgressLabel &&
        progress !== undefined ? (
          <Text style={styles.meta}>{`${Math.round(progress * 100)}%`}</Text>
        ) : null}
        <View style={styles.actions}>
          {item.previewable && onPreview ? (
            <IconButton
              icon="eye"
              accessibilityLabel={`预览${name}`}
              onPress={() => onPreview(item)}
            />
          ) : null}
          {item.removable && onRemove ? (
            <IconButton
              icon="close"
              accessibilityLabel={`移除${name}`}
              disabled={item.removeDisabled}
              onPress={() => onRemove(item)}
            />
          ) : null}
          {item.actions?.map((action) => (
            <Button
              key={action.id}
              label={action.label}
              leftIcon={action.icon}
              variant="secondary"
              style={styles.action}
              disabled={action.disabled}
              loading={action.loading}
              accessibilityHint={action.accessibilityHint}
              onPress={action.onPress}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
