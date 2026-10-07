import { Pressable, Text, View } from 'react-native';
import {
  Button,
  CircularProgress,
  Icon,
  IconButton,
  radius,
  Spinner,
  Thumbnail,
  useColors,
  useThemedStyles,
} from '@unif/react-native-design';
import {
  ATTACHMENT_ICONS,
  ATTACHMENT_STATUS_OWNER_SIZE,
  ROW_IMAGE_SIZE,
  STATUS_LABELS,
} from './constants';
import { createStyles } from './styles';
import type { AttachmentItemProps } from './types';

export function AttachmentItem({
  item,
  width,
  imageSize,
  row,
  mixed = false,
  compact = false,
  showProgressLabel = false,
  onPreview,
  onRemove,
}: AttachmentItemProps) {
  const styles = useThemedStyles(createStyles);
  const colors = useColors();
  const name = item.name || '未命名附件';
  const status = item.status ?? 'idle';
  const busy = status === 'uploading' || status === 'processing';
  const failed = status === 'failed';
  const caption = item.loadingVisual === 'caption';
  const progress =
    status === 'uploading' &&
    typeof item.progress === 'number' &&
    Number.isFinite(item.progress) &&
    item.progress >= 0 &&
    item.progress <= 1
      ? item.progress
      : undefined;
  const statusText = item.statusText ?? STATUS_LABELS[status];
  const previewable = item.previewable && onPreview;
  const separatePreview = previewable && (busy || failed);
  const removable = item.removable && onRemove;
  const singleAction = item.actions?.length === 1 ? item.actions[0] : undefined;
  const retry =
    failed &&
    !caption &&
    singleAction &&
    (singleAction.id === 'retry' ||
      singleAction.icon === 'retry' ||
      singleAction.icon === 'refresh')
      ? singleAction
      : undefined;
  const icon = (
    <Icon name={ATTACHMENT_ICONS[item.kind ?? 'file']} size={ROW_IMAGE_SIZE} />
  );
  const thumbnail = item.thumbnail ? (
    <Thumbnail
      source={item.thumbnail}
      size={{ width: imageSize, height: imageSize, borderRadius: radius.sm }}
      fallback={icon}
    />
  ) : (
    <View style={[styles.placeholder, { width: imageSize, height: imageSize }]}>
      {icon}
    </View>
  );
  const statusVisual =
    busy || failed ? (
      <View style={styles.statusVisual}>
        {failed ? (
          <Icon
            name={retry?.icon ?? 'refresh'}
            size={16}
            color={colors.onPrimary}
          />
        ) : progress !== undefined ? (
          <CircularProgress
            value={progress}
            size={36}
            showLabel={showProgressLabel}
            color={colors.onPrimary}
            accessibilityLabel={`${name}上传进度`}
          />
        ) : (
          <Spinner size={16} color={colors.onPrimary} />
        )}
      </View>
    ) : null;
  const statusOwner =
    !caption && statusVisual ? (
      retry ? (
        <Pressable
          style={[
            styles.statusOwner,
            {
              top: (imageSize - ATTACHMENT_STATUS_OWNER_SIZE) / 2,
              left: (imageSize - ATTACHMENT_STATUS_OWNER_SIZE) / 2,
            },
            styles.retryOwner,
          ]}
          accessibilityRole="button"
          accessibilityLabel={retry.label}
          accessibilityHint={retry.accessibilityHint}
          accessibilityState={{
            disabled: !!(retry.disabled || retry.loading),
            busy: !!retry.loading,
          }}
          disabled={retry.disabled || retry.loading}
          onPress={() => retry.onPress()}
        >
          {statusVisual}
        </Pressable>
      ) : (
        <View
          style={[
            styles.statusOwner,
            {
              top: (imageSize - ATTACHMENT_STATUS_OWNER_SIZE) / 2,
              left: (imageSize - ATTACHMENT_STATUS_OWNER_SIZE) / 2,
            },
          ]}
          accessible
          accessibilityLabel={statusText}
          accessibilityState={{ busy }}
        >
          {statusVisual}
        </View>
      )
    ) : null;
  const actions = item.actions
    ?.filter((action) => action !== retry)
    .map((action) => (
      <Button
        key={action.id}
        label={action.label}
        leftIcon={action.icon}
        variant="secondary"
        style={styles.action}
        size="sm"
        disabled={action.disabled}
        loading={action.loading}
        accessibilityHint={action.accessibilityHint}
        onPress={action.onPress}
      />
    ));

  if (row) {
    const content = (
      <>
        <View style={styles.media}>
          {thumbnail}
          {statusOwner}
        </View>
        <View style={[styles.content, styles.rowContent]}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="middle">
            {name}
          </Text>
          {item.meta ? (
            <Text
              style={[styles.meta, !mixed && styles.fileMeta]}
              numberOfLines={1}
            >
              {item.meta}
            </Text>
          ) : null}
          {statusText ? (
            <Text
              style={[styles.meta, failed && styles.failed]}
              accessibilityLiveRegion="polite"
            >
              {statusText}
            </Text>
          ) : null}
          {busy && caption && showProgressLabel && progress !== undefined ? (
            <Text style={styles.meta}>{`${Math.round(progress * 100)}%`}</Text>
          ) : null}
        </View>
      </>
    );
    return (
      <View style={[styles.item, styles.row, mixed && styles.mixedRow]}>
        {previewable && !retry ? (
          <Pressable
            style={[styles.rowBody, mixed && styles.mixedRowBody]}
            accessibilityRole="button"
            accessibilityLabel={`预览${name}`}
            onPress={() => onPreview?.(item)}
          >
            {content}
          </Pressable>
        ) : (
          <View style={[styles.rowBody, mixed && styles.mixedRowBody]}>
            {content}
          </View>
        )}
        <View style={styles.actions}>
          {previewable && retry ? (
            <IconButton
              icon="eye"
              size="sm"
              accessibilityLabel={`预览${name}`}
              onPress={() => onPreview?.(item)}
            />
          ) : null}
          {removable ? (
            <IconButton
              icon="close"
              size="sm"
              accessibilityLabel={`移除${name}`}
              disabled={item.removeDisabled}
              onPress={() => onRemove?.(item)}
            />
          ) : null}
          {actions}
        </View>
      </View>
    );
  }

  const removeLeft = compact
    ? Math.max(0, imageSize - ATTACHMENT_STATUS_OWNER_SIZE)
    : previewable && !separatePreview
      ? width!
      : (busy && !caption) || failed
        ? (imageSize - ATTACHMENT_STATUS_OWNER_SIZE) / 2 +
          ATTACHMENT_STATUS_OWNER_SIZE
        : imageSize - ATTACHMENT_STATUS_OWNER_SIZE;
  const ownerWidth = removable
    ? Math.max(width!, removeLeft + ATTACHMENT_STATUS_OWNER_SIZE)
    : width;
  const picture = (
    <>
      {thumbnail}
      {item.kind !== 'image' ? (
        <Text style={styles.documentName} numberOfLines={2}>
          {name}
        </Text>
      ) : null}
    </>
  );
  return (
    <View style={[styles.tileOwner, { width: ownerWidth }]}>
      {previewable && !separatePreview ? (
        <Pressable
          style={[
            styles.tile,
            { width, height: imageSize },
            failed && styles.tileFailed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`预览${name}`}
          onPress={() => onPreview?.(item)}
        >
          {picture}
        </Pressable>
      ) : (
        <View
          style={[
            styles.tile,
            { width, height: imageSize },
            failed && styles.tileFailed,
          ]}
          accessible={!statusOwner}
          accessibilityLabel={name}
        >
          {picture}
        </View>
      )}
      {statusOwner}
      {removable ? (
        <Pressable
          style={[
            styles.removeOwner,
            { left: removeLeft },
            (compact ||
              removeLeft === imageSize - ATTACHMENT_STATUS_OWNER_SIZE) &&
              styles.removeInCell,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`移除${name}`}
          disabled={item.removeDisabled}
          accessibilityState={{ disabled: !!item.removeDisabled }}
          onPress={() => onRemove?.(item)}
        >
          <View style={[styles.removeVisual, failed && styles.removeFailed]}>
            <Icon
              name="close"
              size={10}
              color={colors.onPrimary}
              strokeWidth={2.5}
            />
          </View>
        </Pressable>
      ) : null}
      {caption && (busy || failed) ? (
        <View style={styles.caption} accessibilityLiveRegion="polite">
          {status === 'processing' ? <Spinner size={10} /> : null}
          <Text
            style={[styles.captionText, failed && styles.failed]}
            numberOfLines={1}
          >
            {statusText}
          </Text>
          {showProgressLabel && progress !== undefined ? (
            <Text
              style={styles.captionText}
            >{`${Math.round(progress * 100)}%`}</Text>
          ) : null}
        </View>
      ) : null}
      {separatePreview ? (
        <View style={styles.previewAction}>
          <IconButton
            icon="eye"
            size="sm"
            accessibilityLabel={`预览${name}`}
            onPress={() => onPreview?.(item)}
          />
        </View>
      ) : null}
      {actions?.length ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}
