import type { IconName } from '@unif/react-native-design';
import type { FeedbackTone } from './types';

export const FEEDBACK_TONE_LABELS: Readonly<Record<FeedbackTone, string>> = {
  info: '信息',
  success: '成功',
  warning: '警告',
  error: '错误',
};

export const FEEDBACK_TONE_ICONS: Readonly<Record<FeedbackTone, IconName>> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
};
