import {
  CloseOutlined,
  EyeOutlined,
  RefreshOutlined,
} from '@unif/react-native-icons';
import { Pressable, Text, View } from 'react-native';
import {
  Button,
  CircularProgress,
  GlassLayer,
  IconButton,
  radius,
  Spinner,
  Thumbnail,
  useColors,
  useThemedStyles,
} from '@unif/react-native-design';
import {
  ATTACHMENT_ICONS,
  PREVIEW_IMAGE_RADIUS,
  ATTACHMENT_STATUS_OWNER_SIZE,
  ATTACHMENT_REMOVE_OWNER_SIZE,
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
  preview = false,
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
  const progressLabel =
    progress === undefined
      ? undefined
      : `${Math.round(progress * 100)}${item.kind === 'image' ? '' : '%'}`;
  const previewable = item.previewable && onPreview;
  const separatePreview = previewable && (busy || failed);
  const removable = item.removable && onRemove;
  const singleAction = item.actions?.length === 1 ? item.actions[0] : undefined;
  const retry =
    failed && !caption && singleAction?.id === 'retry'
      ? singleAction
      : undefined;
  const statusLeft = (imageSize - ATTACHMENT_STATUS_OWNER_SIZE) / 2;
  const retryLeft =
    preview && removable
      ? Math.min(
          statusLeft,
          imageSize -
            ATTACHMENT_REMOVE_OWNER_SIZE -
            ATTACHMENT_STATUS_OWNER_SIZE
        )
      : statusLeft;
  const Glyph = ATTACHMENT_ICONS[item.kind ?? 'file'];
  const icon = <Glyph size={ROW_IMAGE_SIZE} color={colors.foregroundMuted} />;
  const thumbnail = item.thumbnail ? (
    <Thumbnail
      source={item.thumbnail}
      size={{
        width: imageSize,
        height: imageSize,
        borderRadius: preview ? PREVIEW_IMAGE_RADIUS : radius.sm,
      }}
      fallback={icon}
    />
  ) : (
    <View style={[styles.placeholder, { width: imageSize, height: imageSize }]}>
      {icon}
    </View>
  );
  const Glyph2 = retry?.icon ?? RefreshOutlined;
  const statusVisual =
    busy || failed ? (
      <View style={styles.statusVisual}>
        <GlassLayer colorScheme="dark" style={styles.circleGlass} />
        {failed ? (
          <Glyph2 size={16} color={colors.onPrimary} />
        ) : progress !== undefined ? (
          <CircularProgress
            value={progress}
            size={36}
            showLabel={showProgressLabel}
            formatLabel={item.kind === 'image' ? String : undefined}
            color={colors.onPrimary}
            labelColor={colors.onPrimary}
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
              left: retryLeft,
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
              left: statusLeft,
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
            <Text
              style={styles.meta}
              accessibilityLabel={`${Math.round(progress * 100)}%`}
            >
              {progressLabel}
            </Text>
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
              icon={EyeOutlined}
              size="sm"
              accessibilityLabel={`预览${name}`}
              onPress={() => onPreview?.(item)}
            />
          ) : null}
          {removable ? (
            <IconButton
              icon={CloseOutlined}
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

  // 大图的移除入口收在右上角；紧凑格为预览／重试保留独立操作槽。
  const removeInCell = compact && !(previewable && !separatePreview) && !retry;
  const removeLeft =
    preview || removeInCell
      ? Math.max(0, imageSize - ATTACHMENT_REMOVE_OWNER_SIZE)
      : previewable && !separatePreview
        ? width!
        : (busy && !caption) || failed
          ? (imageSize - ATTACHMENT_STATUS_OWNER_SIZE) / 2 +
            ATTACHMENT_STATUS_OWNER_SIZE
          : imageSize - ATTACHMENT_REMOVE_OWNER_SIZE;
  const ownerWidth = removable
    ? Math.max(width!, removeLeft + ATTACHMENT_REMOVE_OWNER_SIZE)
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
            {
              width,
              height: imageSize,
              ...(preview ? { borderRadius: PREVIEW_IMAGE_RADIUS } : {}),
            },
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
            {
              width,
              height: imageSize,
              ...(preview ? { borderRadius: PREVIEW_IMAGE_RADIUS } : {}),
            },
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
            (removeInCell ||
              removeLeft === imageSize - ATTACHMENT_REMOVE_OWNER_SIZE) &&
              styles.removeInCell,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`移除${name}`}
          disabled={item.removeDisabled}
          accessibilityState={{ disabled: !!item.removeDisabled }}
          onPress={() => onRemove?.(item)}
        >
          <View
            style={[
              styles.removeVisual,
              preview && styles.previewRemoveVisual,
              failed && styles.removeFailed,
            ]}
          >
            {!failed ? (
              <GlassLayer colorScheme="dark" style={styles.circleGlass} />
            ) : null}
            <CloseOutlined
              size={preview ? 12 : 10}
              color={colors.onPrimary}
              strokeWidth={2.5}
            />
          </View>
        </Pressable>
      ) : null}
      {caption && (busy || failed) ? (
        <View
          style={[styles.caption, { width: imageSize }]}
          accessibilityLiveRegion="polite"
        >
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
              accessibilityLabel={`${Math.round(progress * 100)}%`}
            >
              {progressLabel}
            </Text>
          ) : null}
        </View>
      ) : null}
      {separatePreview ? (
        <View style={[styles.previewAction, { width: imageSize }]}>
          <IconButton
            icon={EyeOutlined}
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
