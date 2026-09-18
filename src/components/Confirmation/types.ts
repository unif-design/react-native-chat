import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type ConfirmationStatus =
  'pending' | 'processing' | 'confirmed' | 'cancelled';

export interface ConfirmationProps {
  title: string;
  children: ReactNode;
  status: ConfirmationStatus;
  onConfirm?(): void;
  onCancel?(): void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  cancelDisabled?: boolean;
  statusText?: string;
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
