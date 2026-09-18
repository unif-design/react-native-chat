import type { MessageListExampleItem } from './types';

export const FIXED_MESSAGE_ITEMS: readonly MessageListExampleItem[] = [
  ...Array.from({ length: 120 }, (_, index) => ({
    id: `fixed-${index + 1}`,
    text: `固定消息 ${index + 1}：用于真实 Web／RN 长列表滚动检查。`,
    placement: index % 2 === 0 ? ('start' as const) : ('end' as const),
    status: 'idle' as const,
  })),
  {
    id: 'streaming-message',
    text: '流式累计正文：',
    placement: 'start',
    status: 'streaming',
  },
];

export const EARLIER_MESSAGE_ITEMS: readonly MessageListExampleItem[] =
  Array.from({ length: 12 }, (_, index) => ({
    id: `earlier-${index + 1}`,
    text: `更早消息 ${index + 1}：由示例明确前插。`,
    placement: index % 2 === 0 ? ('end' as const) : ('start' as const),
    status: 'idle' as const,
  }));

export const STREAM_GROWTH_CHUNKS = [
  '第一段。',
  '第二段继续增长。',
  '第三段让已有行再次增高。',
] as const;
