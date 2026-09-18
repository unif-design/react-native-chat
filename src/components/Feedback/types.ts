import type { StyleProp, ViewStyle } from 'react-native';
import type { ChatAction } from '../../actions';

export type FeedbackTone = 'info' | 'success' | 'warning' | 'error';

export interface FeedbackProps {
  message: string;
  title?: string;
  tone?: FeedbackTone;
  action?: ChatAction;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
