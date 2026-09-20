import type { IconName } from '@unif/react-native-design';
import type { StyleProp, ViewStyle } from 'react-native';

export interface SuggestionItem {
  id: string;
  label: string;
  /** 14 布局单位的主题主色图标，普通与选中状态保持相同图标样式。 */
  icon?: IconName;
  selected?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export interface SuggestionsProps {
  items: readonly SuggestionItem[];
  onSelect?(item: SuggestionItem): void;
  align?: 'start' | 'center';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
