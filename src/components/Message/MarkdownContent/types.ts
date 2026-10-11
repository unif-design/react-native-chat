import type { StyleProp, ViewStyle } from 'react-native';

export interface MarkdownContentProps {
  text: string;
  onLinkPress?(url: string): void;
  outgoing?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface MarkdownSvgLabelProps {
  alt?: string;
}
