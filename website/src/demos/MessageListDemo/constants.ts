import type { DemoListMessage } from './types';

export const INITIAL_MESSAGES: readonly DemoListMessage[] = [
  { id: 'm1', placement: 'start', text: '我们从本周的目标开始整理。' },
  { id: 'm2', placement: 'end', text: '先列出已经完成的部分。' },
  { id: 'm3', placement: 'start', text: '已完成组件拆分和公开类型核对。' },
  { id: 'm4', placement: 'end', text: '再补充需要验证的交互。' },
  {
    id: 'm5',
    placement: 'start',
    text: '输入、附件和消息列表都需要独立展示。',
  },
  { id: 'm6', placement: 'end', text: '好的，保持样例简洁。' },
  {
    id: 'm7',
    placement: 'start',
    text: '这条是当前最新消息，继续追加时会保持末尾跟随。',
    status: 'streaming',
  },
];

export const EARLIER_MESSAGES: readonly DemoListMessage[] = [
  { id: 'old-1', placement: 'start', text: '更早的讨论从展示目标开始。' },
  { id: 'old-2', placement: 'end', text: '希望首屏能直接看到真实组件。' },
  { id: 'old-3', placement: 'start', text: '历史消息已在当前位置之前插入。' },
];
