import type { ComposerExampleVoiceStatus, ComposerPrimaryMode } from './types';

export const LONG_COMPOSER_TEXT =
  '这是一段用于检查多行输入增长、达到最大高度后内部滚动，以及清空后恢复高度的固定长文。'.repeat(
    8
  );

export const PRIMARY_MODES: readonly {
  value: ComposerPrimaryMode;
  label: string;
}[] = [
  { value: 'send', label: '发送动作' },
  { value: 'stop', label: '停止动作' },
  { value: 'busy', label: '忙碌动作' },
];

export const VOICE_STATUSES: readonly {
  value: ComposerExampleVoiceStatus;
  label: string;
}[] = [
  { value: 'idle', label: '语音空闲' },
  { value: 'starting', label: '语音准备' },
  { value: 'listening', label: '语音聆听' },
  { value: 'finishing', label: '语音收尾' },
];
