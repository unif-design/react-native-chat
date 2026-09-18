import type { GestureResponderEvent } from 'react-native';
import { INTERACTIVE_CONTENT_SELECTOR } from './constants';

export function isNestedAction(event: GestureResponderEvent): boolean {
  const { target, currentTarget } = event;
  // 原生由 responder 交付实际目标；Web 的 RNGH 按钮仍可能冒泡到 RN Pressable。
  if (
    typeof target !== 'object' ||
    target === null ||
    !('closest' in target) ||
    typeof target.closest !== 'function' ||
    typeof currentTarget !== 'object' ||
    currentTarget === null ||
    !('contains' in currentTarget) ||
    typeof currentTarget.contains !== 'function'
  )
    return false;
  const action = target.closest(INTERACTIVE_CONTENT_SELECTOR);
  return Boolean(
    action && action !== currentTarget && currentTarget.contains(action)
  );
}
