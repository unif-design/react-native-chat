import type { SuggestionItem } from '@unif/react-native-chat';

export const SUGGESTIONS: readonly SuggestionItem[] = [
  { id: 'summary', label: '总结要点', icon: 'list' },
  { id: 'todo', label: '整理待办', icon: 'check' },
  { id: 'polish', label: '润色表达', icon: 'edit' },
  { id: 'translate', label: '翻译成英文', icon: 'search' },
  { id: 'busy', label: '正在处理', loading: true },
  { id: 'disabled', label: '暂不可用', disabled: true },
];
