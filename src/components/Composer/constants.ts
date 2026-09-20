import { space, type } from '@unif/react-native-design';

export const COMPOSER_INPUT_LINE_HEIGHT = Math.round(type.body * 1.4);
export const COMPOSER_INPUT_MAX_LINES = 4;
export const COMPOSER_PLAIN_VERTICAL_INSET = 2 * space[4];
export const COMPOSER_ACTION_VISUAL_SIZE = 34;
export const COMPOSER_ACTION_ICON_SIZE = 22;
export const COMPOSER_PRIMARY_ICON_SIZE = 18;
export const COMPOSER_MENU_ICON_CONTAINER_SIZE = 40;
export const COMPOSER_MENU_ICON_SIZE = 20;
export const PRIMARY_LABELS = {
  send: '发送',
  stop: '停止回复',
  busy: '正在处理…',
} as const;
export const VOICE_LABELS = {
  starting: '正在准备语音输入…',
  listening: '正在听取…',
  finishing: '正在完成识别…',
} as const;
