import type { IconName } from '@unif/react-native-design';
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
  Record<ProcessStepStatus, IconName>
> = {
  pending: 'circle-minus',
  running: 'thinking',
  completed: 'success',
  failed: 'error',
  cancelled: 'close',
};
