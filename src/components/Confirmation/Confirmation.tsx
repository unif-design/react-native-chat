import { Text, View } from 'react-native';
import { Button, useThemedStyles } from '@unif/react-native-design';
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
  const resolvedStatusText =
    status === 'pending'
      ? statusText
      : (statusText ?? CONFIRMATION_STATUS_TEXT[status]);

  return (
    <View style={[styles.root, style]} testID={testID}>
      <Text style={styles.title}>{title}</Text>
      <View>{children}</View>
      {resolvedStatusText ? (
        <Text style={styles.status}>{resolvedStatusText}</Text>
      ) : null}
      {status === 'pending' && (onConfirm || onCancel) ? (
        <View style={styles.actions}>
          {onConfirm ? (
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              disabled={confirmDisabled}
              size="sm"
            />
          ) : null}
          {onCancel ? (
            <Button
              label={cancelLabel}
              onPress={onCancel}
              disabled={cancelDisabled}
              size="sm"
              variant="outline"
            />
          ) : null}
        </View>
      ) : null}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}
