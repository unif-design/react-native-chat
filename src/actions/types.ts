import type { ComponentType } from 'react';
import type { IconProps } from '@unif/react-native-icons';

export interface ChatAction {
  id: string;
  label: string;
  icon?: ComponentType<IconProps>;
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
  onPress(): void;
}
