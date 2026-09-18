import type { ConfirmationStatus } from './types';

export const DEFAULT_CONFIRM_LABEL = '确认';
export const DEFAULT_CANCEL_LABEL = '取消';

export const CONFIRMATION_STATUS_TEXT: Readonly<
  Record<Exclude<ConfirmationStatus, 'pending'>, string>
> = {
  processing: '正在处理…',
  confirmed: '已确认',
  cancelled: '已取消',
};
