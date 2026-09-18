import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
const sidebars: SidebarsConfig = {
  componentsSidebar: [
    'components/overview',
    'getting-started',
    {
      type: 'category',
      label: '输入与附件',
      collapsed: false,
      items: ['components/composer', 'components/attachments'],
    },
    {
      type: 'category',
      label: '消息与布局',
      collapsed: false,
      items: [
        'components/message',
        'components/message-list',
        'components/chat',
      ],
    },
    {
      type: 'category',
      label: '交互与反馈',
      collapsed: false,
      items: [
        'components/suggestions',
        'components/confirmation',
        'components/process',
        'components/feedback',
      ],
    },
    {
      type: 'category',
      label: '来源与引用',
      collapsed: false,
      items: ['components/sources', 'components/citation'],
    },
  ],
  compositionSidebar: ['composition/main-chat', 'composition/drawer-input'],
};
export default sidebars;
