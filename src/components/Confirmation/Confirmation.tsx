import { Text, View } from 'react-native';
import {
  Button,
  Icon,
  Spinner,
  useColors,
  useThemedStyles,
} from '@unif/react-native-design';
import {
  CONFIRMATION_STATUS_TEXT,
  DEFAULT_CANCEL_LABEL,
  DEFAULT_CONFIRM_LABEL,
} from './constants';
import { createStyles } from './styles';
import type { ConfirmationProps } from './types';

export function Confirmation({
  title,
  children,
  status,
  onConfirm,
  onCancel,
  confirmLabel = DEFAULT_CONFIRM_LABEL,
  cancelLabel = DEFAULT_CANCEL_LABEL,
  confirmDisabled = false,
  cancelDisabled = false,
  statusText,
  footer,
  style,
  testID,
}: ConfirmationProps): React.JSX.Element {
  const styles = useThemedStyles(createStyles);
  const colors = useColors();
  const tint =
    status === 'confirmed'
      ? colors.success
      : status === 'cancelled'
        ? colors.foregroundSubtle
        : colors.primary;
  const borderColor =
    status === 'cancelled' ? colors.surfaceContainerHighest : tint;
  const resolvedStatusText =
    status === 'pending'
      ? statusText
      : (statusText ?? CONFIRMATION_STATUS_TEXT[status]);

  return (
    <View style={[styles.root, { borderColor }, style]} testID={testID}>
      <View style={styles.heading}>
        {status === 'processing' ? (
          <Spinner size={14} color={tint} />
        ) : (
          <Icon
            name={
              status === 'confirmed'
                ? 'check'
                : status === 'cancelled'
                  ? 'close'
                  : 'warning'
            }
            size={14}
            color={tint}
          />
        )}
        <Text
          style={[styles.title, status === 'cancelled' && styles.cancelled]}
          numberOfLines={2}
        >
          {title}
        </Text>
      </View>
      <View style={styles.body}>{children}</View>
      {resolvedStatusText ? (
        <Text style={styles.status}>{resolvedStatusText}</Text>
      ) : null}
      {status === 'pending' && (onConfirm || onCancel) ? (
        <View style={styles.actions}>
          {onCancel ? (
            <Button
              label={cancelLabel}
              onPress={onCancel}
              disabled={cancelDisabled}
              block
              variant="secondary"
            />
          ) : null}
          {onConfirm ? (
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              disabled={confirmDisabled}
              block
            />
          ) : null}
        </View>
      ) : null}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}
