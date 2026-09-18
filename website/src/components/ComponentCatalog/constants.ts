export const COMPONENTS = [
  {
    name: 'Composer',
    label: '消息输入',
    description: '受控草稿、发送和停止，适用于聊天页与独立输入区。',
    path: '/docs/components/composer',
  },
  {
    name: 'Attachments',
    label: '附件',
    description: '统一呈现图片、文件、进度和处理状态。',
    path: '/docs/components/attachments',
  },
  {
    name: 'Message',
    label: '消息',
    description: '普通文本、Markdown 与自定义卡片共用的消息外壳。',
    path: '/docs/components/message',
  },
  {
    name: 'MessageList',
    label: '消息列表',
    description: '有界虚拟列表，支持历史前插与末尾跟随。',
    path: '/docs/components/message-list',
  },
  {
    name: 'Chat',
    label: '聊天布局',
    description: '组合顶部内容、消息区域和底部输入区。',
    path: '/docs/components/chat',
  },
  {
    name: 'Suggestions',
    label: '快捷建议',
    description: '展示选项与调用方提供的选择、禁用和等待状态。',
    path: '/docs/components/suggestions',
  },
  {
    name: 'Confirmation',
    label: '会话确认',
    description: '呈现确认内容、操作入口与外部处理状态。',
    path: '/docs/components/confirmation',
  },
  {
    name: 'Process',
    label: '处理过程',
    description: '展示已整理的步骤、状态、耗时和可展开详情。',
    path: '/docs/components/process',
  },
  {
    name: 'Feedback',
    label: '结果说明',
    description: '呈现提示、结果或问题说明及明确的后续操作。',
    path: '/docs/components/feedback',
  },
  {
    name: 'Sources',
    label: '参考来源',
    description: '展示带编号或标记的来源集合。',
    path: '/docs/components/sources',
  },
  {
    name: 'Citation',
    label: '引用标记',
    description: '可直接嵌入正文的短引用标记。',
    path: '/docs/components/citation',
  },
] as const;
