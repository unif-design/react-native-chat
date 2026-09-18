export interface CitationProps {
  label: string;
  onPress?(): void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}
