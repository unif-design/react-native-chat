import {
  CircleMinusOutlined,
  CloseOutlined,
  ErrorOutlined,
  SuccessOutlined,
  ThinkingOutlined,
} from '@unif/react-native-icons';
import type { ComponentType } from 'react';
import type { IconProps } from '@unif/react-native-icons';

import type { ProcessStepStatus } from './types';

export const PROCESS_STATUS_LABELS: Readonly<
  Record<ProcessStepStatus, string>
> = {
  pending: '待处理',
  running: '处理中',
  completed: '已完成',
  failed: '失败',
  cancelled: '已取消',
};

export const PROCESS_STATUS_ICONS: Readonly<
  Record<ProcessStepStatus, ComponentType<IconProps>>
> = {
  pending: CircleMinusOutlined,
  running: ThinkingOutlined,
  completed: SuccessOutlined,
  failed: ErrorOutlined,
  cancelled: CloseOutlined,
};
