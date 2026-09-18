import { useId, useLayoutEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { USER_INTERACTION_EVENTS } from './constants';
import type {
  UseWebPrependAnchorOptions,
  WebAnchorSnapshot,
  WebElementLike,
  WebGlobals,
  WebPrependAnchorHandle,
  WebPrependAnchorConnection,
} from './types';

function isWebElementLike(value: unknown): value is WebElementLike {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<WebElementLike>;
  return (
    typeof candidate.scrollTop === 'number' &&
    typeof candidate.scrollHeight === 'number' &&
    typeof candidate.getBoundingClientRect === 'function' &&
    typeof candidate.querySelectorAll === 'function' &&
    typeof candidate.contains === 'function' &&
    typeof candidate.addEventListener === 'function' &&
    typeof candidate.removeEventListener === 'function'
  );
}

function sameKeys(left: readonly string[], right: readonly string[]): boolean {
  return (
    left.length === right.length &&
    left.every((key, index) => key === right[index])
  );
}

function isPurePrepend(
  previous: readonly string[],
  current: readonly string[]
): boolean {
  const added = current.length - previous.length;
  return (
    previous.length > 0 &&
    added > 0 &&
    previous.every((key, index) => current[index + added] === key)
  );
}

function disconnectConnection(
  connection: WebPrependAnchorConnection | undefined
) {
  if (!connection) return;
  connection.mutationObserver?.disconnect();
  connection.resizeObserver?.disconnect();
  connection.resizeTargets.clear();
  USER_INTERACTION_EVENTS.forEach((eventName) =>
    connection.scroller.removeEventListener(
      eventName,
      connection.userInteraction,
      { capture: true }
    )
  );
  connection.scroller.removeEventListener('scroll', connection.scroll);
}

export function useWebPrependAnchor({
  listRef,
  itemsIdentity,
  keys,
}: UseWebPrependAnchorOptions): WebPrependAnchorHandle {
  const instanceId = useId();
  const rowNativeIDPrefix = `unif-message-row-${encodeURIComponent(instanceId)}`;
  const preservingPrependRef = useRef(false);
  const previousIdentityRef = useRef<unknown>(itemsIdentity);
  const previousKeysRef = useRef<readonly string[] | undefined>(undefined);
  const lastAnchorRef = useRef<WebAnchorSnapshot | undefined>(undefined);
  const preservationRef = useRef<WebAnchorSnapshot | undefined>(undefined);
  const connectionRef = useRef<WebPrependAnchorConnection | undefined>(
    undefined
  );
  const frameRef = useRef<number | undefined>(undefined);

  const globals = globalThis as unknown as WebGlobals;

  const getRowNativeID = (key: string) =>
    `${rowNativeIDPrefix}-${encodeURIComponent(key)}`;

  const getRows = (scroller: WebElementLike): WebElementLike[] =>
    Array.from(scroller.querySelectorAll('[id]')).filter(
      (candidate): candidate is WebElementLike =>
        isWebElementLike(candidate) &&
        candidate.id.startsWith(`${rowNativeIDPrefix}-`)
    );

  const findRow = (
    scroller: WebElementLike,
    id: string
  ): WebElementLike | undefined => {
    const candidate = globals.document?.getElementById(id);
    return isWebElementLike(candidate) && scroller.contains(candidate)
      ? candidate
      : undefined;
  };

  const captureAnchor = (connection: WebPrependAnchorConnection) => {
    const viewport = connection.scroller.getBoundingClientRect();
    const firstVisible = getRows(connection.scroller).find((row) => {
      const rect = row.getBoundingClientRect();
      return rect.bottom > viewport.top && rect.top < viewport.bottom;
    });
    if (!firstVisible) return;
    lastAnchorRef.current = {
      id: firstVisible.id,
      top: firstVisible.getBoundingClientRect().top - viewport.top,
      scrollHeight: connection.scroller.scrollHeight,
      scrollTop: connection.scroller.scrollTop,
    };
  };

  const refreshResizeTargets = (connection: WebPrependAnchorConnection) => {
    const resizeObserver = connection.resizeObserver;
    if (!resizeObserver) return;
    const nextTargets = new Set([
      connection.scroller,
      ...getRows(connection.scroller),
    ]);
    connection.resizeTargets.forEach((target) => {
      if (!nextTargets.has(target)) resizeObserver.unobserve?.(target);
    });
    nextTargets.forEach((target) => {
      if (!connection.resizeTargets.has(target)) resizeObserver.observe(target);
    });
    connection.resizeTargets = nextTargets;
  };

  const correctPrepend = (connection: WebPrependAnchorConnection) => {
    const preservation = preservationRef.current;
    if (!preservation) return;
    const anchor = findRow(connection.scroller, preservation.id);
    if (anchor) {
      const viewport = connection.scroller.getBoundingClientRect();
      const currentTop = anchor.getBoundingClientRect().top - viewport.top;
      const delta = currentTop - preservation.top;
      if (Math.abs(delta) > 0.5) {
        connection.list.scrollToOffset({
          offset: Math.max(0, connection.scroller.scrollTop + delta),
          animated: false,
        });
      }
      return;
    }

    const heightDelta = Math.max(
      0,
      connection.scroller.scrollHeight - preservation.scrollHeight
    );
    if (heightDelta > 0) {
      connection.list.scrollToOffset({
        offset: Math.max(0, preservation.scrollTop + heightDelta),
        animated: false,
      });
    }
  };

  const runFrame = () => {
    frameRef.current = undefined;
    const connection = connectionRef.current;
    if (!connection) return;
    refreshResizeTargets(connection);
    if (preservingPrependRef.current) correctPrepend(connection);
    else captureAnchor(connection);
  };

  const scheduleFrame = () => {
    if (frameRef.current !== undefined) return;
    if (globals.requestAnimationFrame) {
      frameRef.current = globals.requestAnimationFrame(runFrame);
    } else {
      runFrame();
    }
  };

  const stopPreserving = () => {
    preservingPrependRef.current = false;
    preservationRef.current = undefined;
    lastAnchorRef.current = undefined;
  };

  const disconnect = () => {
    const connection = connectionRef.current;
    disconnectConnection(connection);
    connectionRef.current = undefined;
    if (frameRef.current !== undefined) {
      globals.cancelAnimationFrame?.(frameRef.current);
      frameRef.current = undefined;
    }
  };

  const ensureConnected = () => {
    if (Platform.OS !== 'web') return;
    const list = listRef.current;
    const scroller = list ? list.getScrollableNode() : undefined;
    if (!list || !isWebElementLike(scroller)) {
      disconnect();
      return;
    }
    if (connectionRef.current?.scroller === scroller) return;
    disconnect();
    stopPreserving();

    const userInteraction = () => {
      stopPreserving();
      const currentConnection = connectionRef.current;
      if (currentConnection) captureAnchor(currentConnection);
      scheduleFrame();
    };
    const scroll = () => scheduleFrame();
    const mutationObserver = globals.MutationObserver
      ? new globals.MutationObserver(scheduleFrame)
      : undefined;
    const resizeObserver = globals.ResizeObserver
      ? new globals.ResizeObserver(scheduleFrame)
      : undefined;
    const connection: WebPrependAnchorConnection = {
      list,
      scroller,
      mutationObserver,
      resizeObserver,
      resizeTargets: new Set(),
      userInteraction,
      scroll,
    };
    connectionRef.current = connection;
    mutationObserver?.observe(scroller, {
      childList: true,
      subtree: true,
    });
    USER_INTERACTION_EVENTS.forEach((eventName) =>
      scroller.addEventListener(eventName, userInteraction, {
        capture: true,
        passive: eventName === 'wheel' || eventName === 'touchstart',
      })
    );
    scroller.addEventListener('scroll', scroll, { passive: true });
    refreshResizeTargets(connection);
    scheduleFrame();
  };

  const cancelPrependPreservation = () => {
    stopPreserving();
    scheduleFrame();
  };

  useLayoutEffect(() => {
    ensureConnected();
    const previousKeys = previousKeysRef.current;
    const identityChanged = previousIdentityRef.current !== itemsIdentity;
    if (previousKeys) {
      const keysChanged = !sameKeys(previousKeys, keys);
      if (
        keysChanged &&
        isPurePrepend(previousKeys, keys) &&
        lastAnchorRef.current
      ) {
        preservationRef.current = lastAnchorRef.current;
        preservingPrependRef.current = true;
      } else if (keysChanged || identityChanged) {
        stopPreserving();
      }
    }
    previousIdentityRef.current = itemsIdentity;
    previousKeysRef.current = [...keys];
    scheduleFrame();
  });

  useLayoutEffect(
    () => () => {
      disconnectConnection(connectionRef.current);
      connectionRef.current = undefined;
      if (frameRef.current !== undefined) {
        (globalThis as unknown as WebGlobals).cancelAnimationFrame?.(
          frameRef.current
        );
        frameRef.current = undefined;
      }
    },
    []
  );

  return {
    rowNativeIDPrefix,
    getRowNativeID,
    preservingPrependRef,
    cancelPrependPreservation,
  };
}
