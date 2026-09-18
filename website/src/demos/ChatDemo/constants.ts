import type { ChatMessage } from './types';

export const INITIAL_MESSAGES: readonly ChatMessage[] = [
  {
    id: 'welcome',
    placement: 'start',
    text: '你好，我可以和你一起整理今天的待办。',
  },
  {
    id: 'reply',
    placement: 'end',
    text: '先帮我留一条提醒。',
  },
];
