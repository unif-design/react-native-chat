import { useCallback, useId, useRef } from 'react';
import type {
  UseWebPrependAnchorOptions,
  WebPrependAnchorHandle,
} from './types';

export function useWebPrependAnchor(
  _options: UseWebPrependAnchorOptions
): WebPrependAnchorHandle {
  const instanceId = useId();
  const rowNativeIDPrefix = `unif-message-row-${encodeURIComponent(instanceId)}`;
  const preservingPrependRef = useRef(false);
  const getRowNativeID = useCallback(
    (key: string) => `${rowNativeIDPrefix}-${encodeURIComponent(key)}`,
    [rowNativeIDPrefix]
  );
  const cancelPrependPreservation = useCallback(() => {
    preservingPrependRef.current = false;
  }, []);

  return {
    rowNativeIDPrefix,
    getRowNativeID,
    preservingPrependRef,
    cancelPrependPreservation,
  };
}
