import {
  ErrorOutlined,
  InfoOutlined,
  SuccessOutlined,
  WarningOutlined,
} from '@unif/react-native-icons';
import type { ComponentType } from 'react';
import type { IconProps } from '@unif/react-native-icons';

import type { FeedbackTone } from './types';

export const FEEDBACK_TONE_LABELS: Readonly<Record<FeedbackTone, string>> = {
  info: '信息',
  success: '成功',
  warning: '警告',
  error: '错误',
};

export const FEEDBACK_TONE_ICONS: Readonly<
  Record<FeedbackTone, ComponentType<IconProps>>
> = {
  info: InfoOutlined,
  success: SuccessOutlined,
  warning: WarningOutlined,
  error: ErrorOutlined,
};
