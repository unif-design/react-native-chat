import type { IconName } from '@unif/react-native-design';

export interface ChatAction {
  id: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
  onPress(): void;
}
