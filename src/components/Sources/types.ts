import type { StyleProp, ViewStyle } from 'react-native';

export interface SourceItem {
  id: string;
  label: string;
  title?: string;
  description?: string;
  disabled?: boolean;
}

export interface SourcesProps {
  items: readonly SourceItem[];
  title?: string;
  onPress?(item: SourceItem): void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
