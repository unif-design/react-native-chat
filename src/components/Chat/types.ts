import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
export interface ChatProps {
  children: ReactNode;
  composer?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  bottomInset?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
