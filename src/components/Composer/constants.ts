import { space, type } from '@unif/react-native-design';

export const COMPOSER_INPUT_LINE_HEIGHT = Math.round(type.body * 1.4);
export const COMPOSER_INPUT_MAX_LINES = 4;
export const COMPOSER_PLAIN_VERTICAL_INSET = 2 * space[3];
export const COMPOSER_ACTION_VISUAL_SIZE = 34;
export const COMPOSER_ACTION_ICON_SIZE = 22;
export const COMPOSER_PRIMARY_ICON_SIZE = 18;
export const COMPOSER_CANCEL_ICON_SIZE = 20;
export const COMPOSER_VOICE_WAVE_COUNT = 5;
export const COMPOSER_VOICE_WAVE_STAGGER_MS = 90;
export const COMPOSER_VOICE_WAVE_GROUPS = [
  { from: 6, to: 20, duration: 1100 },
  { from: 14, to: 5, duration: 1000 },
  { from: 8, to: 18, duration: 900 },
] as const;
export const COMPOSER_VOICE_WAVE_PATTERN = Array.from(
  { length: COMPOSER_VOICE_WAVE_COUNT },
  (_, index) =>
    COMPOSER_VOICE_WAVE_GROUPS[index % COMPOSER_VOICE_WAVE_GROUPS.length]!
);
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
