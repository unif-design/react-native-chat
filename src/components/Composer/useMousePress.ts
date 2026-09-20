import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { PointerEvent } from 'react-native';

export function useMousePress(disabled: boolean) {
  const [pressed, setPressed] = useState(false);
  const enabled = Platform.OS === 'web' && !disabled;
  useEffect(() => {
    if (disabled) setPressed(false);
  }, [disabled]);

  function begin(event: PointerEvent) {
    if (
      event.nativeEvent.pointerType !== 'mouse' ||
      event.nativeEvent.button !== 0
    )
      return;
    // 阻止默认聚焦后不会产生兼容 mousedown，局部投影按住状态；点击仍交给 SDK。
    event.preventDefault();
    setPressed(true);
  }
  function end(event: PointerEvent) {
    if (event.nativeEvent.pointerType === 'mouse') setPressed(false);
  }
  return {
    mousePressed: enabled && pressed,
    onPointerDown: enabled ? begin : undefined,
    onPointerUp: enabled ? end : undefined,
    onPointerCancel: enabled ? end : undefined,
    onPointerLeave: enabled ? end : undefined,
  };
}
