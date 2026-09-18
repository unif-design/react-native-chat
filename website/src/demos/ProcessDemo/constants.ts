import type { ProcessDemoStep } from './types';

export const PROCESS_STEPS: readonly ProcessDemoStep[] = [
  {
    id: 'read',
    title: '读取输入',
    description: '已整理 6 条文字',
    status: 'completed',
    elapsedMs: 680,
  },
  {
    id: 'organize',
    title: '组织回答',
    description: '正在组合清晰的内容层级',
    status: 'running',
  },
  {
    id: 'review',
    title: '等待确认',
    description: '草稿等待你的确认',
    status: 'pending',
  },
];
