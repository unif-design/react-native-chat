import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type {
  DimensionValue,
  FlatList,
  FlatListProps,
  LayoutChangeEvent,
  LayoutRectangle,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { DEFAULT_END_THRESHOLD } from './constants';
import type {
  ListMeasurements,
  MessageListAnchorOptions,
  MessageListAnchorRequest,
  MessageListItemLayout,
  MessageListPendingScroll,
  MessageListProps,
  MessageListScrollOptions,
} from './types';

interface MessageListScrollInput<T> extends Pick<
  MessageListProps<T>,
  'initialPosition' | 'followOutput' | 'endThreshold' | 'onAtEndChange'
> {
  listRef: RefObject<FlatList<T> | null>;
  keys: readonly string[];
  contentMinimumHeight?: DimensionValue;
  contentBottomPadding?: DimensionValue;
  hasFooter?: boolean;
  preservingPrependRef: RefObject<boolean>;
  cancelPrependPreservation(): void;
}

function layoutValue(value: DimensionValue | undefined, extent: number) {
  if (typeof value === 'number' && Number.isFinite(value))
    return Math.max(0, value);
  if (typeof value === 'string' && value.endsWith('%')) {
    const percentage = Number.parseFloat(value);
    if (Number.isFinite(percentage))
      return Math.max(0, (extent * percentage) / 100);
  }
  return 0;
}

export function useMessageListScroll<T>({
  listRef,
  keys,
  initialPosition,
  followOutput,
  endThreshold = DEFAULT_END_THRESHOLD,
  onAtEndChange,
  contentMinimumHeight,
  contentBottomPadding,
  hasFooter,
  preservingPrependRef,
  cancelPrependPreservation,
}: MessageListScrollInput<T>) {
  const measurements = useRef<ListMeasurements>({
    width: 0,
    viewport: 0,
    content: 0,
    offset: 0,
    hasContentSize: false,
  });
  const initial = useRef(initialPosition);
  const initialized = useRef(false);
  const previousKeys = useRef<readonly string[]>([]);
  const currentKeys = useRef(keys);
  currentKeys.current = keys;
  const contentStyle = useRef({ contentMinimumHeight, contentBottomPadding });
  contentStyle.current = { contentMinimumHeight, contentBottomPadding };
  const prependPending = useRef(false);
  const pendingScroll = useRef<MessageListPendingScroll | undefined>(undefined);
  const userScrolling = useRef(false);
  const atEndRef = useRef<boolean | undefined>(undefined);
  const [atEnd, setAtEnd] = useState(true);
  const anchor = useRef<MessageListAnchorRequest | undefined>(undefined);
  const layouts = useRef(new Map<string, MessageListItemLayout>());
  const layoutRevision = useRef(0);
  const footerHeight = useRef(0);
  if (!hasFooter) footerHeight.current = 0;
  const layoutChanged = useRef<() => void>(() => {});
  const [anchorMinimumHeight, setAnchorMinimumHeight] = useState<number>();
  const minimumRef = useRef<number | undefined>(undefined);
  const threshold = Number.isFinite(endThreshold)
    ? Math.max(0, endThreshold)
    : DEFAULT_END_THRESHOLD;

  const ready = useCallback(() => {
    const current = measurements.current;
    return current.viewport > 0 && current.hasContentSize;
  }, []);

  const publishPosition = useCallback(() => {
    if (!ready()) return;
    const { viewport, content, offset } = measurements.current;
    const next = content - viewport - Math.max(0, offset) <= threshold;
    if (next !== atEndRef.current) {
      atEndRef.current = next;
      setAtEnd(next);
      onAtEndChange?.(next);
    }
  }, [onAtEndChange, ready, threshold]);

  const cancelAnchor = useCallback(() => {
    anchor.current = undefined;
    minimumRef.current = undefined;
    setAnchorMinimumHeight(undefined);
  }, []);

  const naturalContentHeight = useCallback(() => {
    const last = currentKeys.current.at(-1);
    const cell =
      last === undefined ? undefined : layouts.current.get(last)?.cell;
    if (!cell) return undefined;
    const { width, viewport } = measurements.current;
    return Math.max(
      cell.y +
        cell.height +
        footerHeight.current +
        layoutValue(contentStyle.current.contentBottomPadding, width),
      layoutValue(contentStyle.current.contentMinimumHeight, viewport)
    );
  }, []);

  const applyAnchor = useCallback(() => {
    const request = anchor.current;
    if (!request || !ready()) return;
    const index = currentKeys.current.indexOf(request.key);
    if (index < 0) return;
    request.seen = true;
    const position = layouts.current.get(request.key);
    if (!position?.cell || position.itemY === undefined) {
      // An offscreen row first needs to enter FlatList's render window. This
      // estimate only reveals it; success still requires its actual layouts.
      if (request.locatedAt !== layoutRevision.current) {
        request.locatedAt = layoutRevision.current;
        listRef.current?.scrollToIndex({
          index,
          animated: false,
          viewPosition: 0,
        });
      }
      return;
    }
    const { viewport, content } = measurements.current;
    const offset = Math.max(
      0,
      position.cell.y + position.itemY - request.topOffset
    );
    const minimum = Math.max(
      offset + viewport,
      layoutValue(contentStyle.current.contentMinimumHeight, viewport)
    );
    minimumRef.current = minimum;
    setAnchorMinimumHeight(minimum);
    // Yoga's requested minimum is not yet native scroll space. Wait for the
    // content-size event; otherwise native scrolling can clamp the target.
    if (content + 0.5 < minimum) return;
    if (request.offset === offset && request.viewport === viewport) return;
    request.offset = offset;
    request.viewport = viewport;
    request.settled = false;
    initialized.current = true;
    listRef.current?.scrollToOffset({ offset, animated: request.animated });
    measurements.current.offset = offset;
    publishPosition();
  }, [listRef, publishPosition, ready]);

  const onCellLayout = useCallback(
    (key: string, index: number, cell: LayoutRectangle) => {
      if (
        currentKeys.current[index] !== key ||
        !Number.isFinite(cell.y) ||
        !Number.isFinite(cell.height)
      )
        return;
      const previous = layouts.current.get(key);
      if (
        previous?.index !== index ||
        previous.cell?.x !== cell.x ||
        previous.cell.y !== cell.y ||
        previous.cell.width !== cell.width ||
        previous.cell.height !== cell.height
      )
        layoutRevision.current++;
      layouts.current.set(key, { ...previous, index, cell });
      layoutChanged.current();
    },
    []
  );
  const onItemLayout = useCallback(
    (key: string, index: number, itemY: number) => {
      if (currentKeys.current[index] !== key || !Number.isFinite(itemY)) return;
      const previous = layouts.current.get(key);
      if (previous?.index !== index || previous.itemY !== itemY)
        layoutRevision.current++;
      layouts.current.set(key, { ...previous, index, itemY });
      layoutChanged.current();
    },
    []
  );
  const onCellUnmount = useCallback((key: string, index: number) => {
    if (layouts.current.get(key)?.index === index) {
      layouts.current.delete(key);
      layoutRevision.current++;
    }
  }, []);
  const onFooterLayout = useCallback((event: LayoutChangeEvent) => {
    footerHeight.current = event.nativeEvent.layout.height;
    layoutChanged.current();
  }, []);

  const anchorToItem = useCallback(
    (key: string, options: MessageListAnchorOptions = {}) => {
      pendingScroll.current = undefined;
      cancelPrependPreservation();
      userScrolling.current = false;
      anchor.current = {
        key,
        topOffset: Number.isFinite(options.topOffset)
          ? Math.max(0, options.topOffset!)
          : 0,
        animated: options.animated ?? true,
        seen: currentKeys.current.includes(key),
      };
      minimumRef.current = 0;
      setAnchorMinimumHeight(0);
      applyAnchor();
    },
    [applyAnchor, cancelPrependPreservation]
  );

  useLayoutEffect(() => {
    const previous = previousKeys.current;
    const added = keys.length - previous.length;
    const onlyPrepended =
      previous.length > 0 &&
      added > 0 &&
      previous.every((key, index) => keys[index + added] === key);
    const changed =
      keys.length !== previous.length ||
      keys.some((key, index) => key !== previous[index]);
    if (changed) {
      layoutRevision.current++;
      prependPending.current = onlyPrepended;
      const indices = new Map(keys.map((key, index) => [key, index]));
      for (const [key, layout] of layouts.current) {
        const index = indices.get(key);
        if (index === undefined) layouts.current.delete(key);
        else if (index !== layout.index) {
          // A moved cell gets a new natural y; the row's local separator
          // offset remains valid until an actual layout change replaces it.
          layouts.current.set(key, { index, itemY: layout.itemY });
        }
      }
    }
    previousKeys.current = keys;
    const request = anchor.current;
    if (request) {
      if (keys.includes(request.key)) request.seen = true;
      else if (request.seen) {
        cancelAnchor();
        return;
      }
      // Explicit positioning and native/Web prepend preservation must never
      // compensate the same layout twice.
      cancelPrependPreservation();
      applyAnchor();
    }
  }, [applyAnchor, cancelAnchor, cancelPrependPreservation, keys]);

  const scrollToEnd = useCallback(
    (options: MessageListScrollOptions = {}) => {
      cancelPrependPreservation();
      const request: MessageListPendingScroll = {
        animated: options.animated ?? true,
      };
      const natural = naturalContentHeight();
      const minimum = minimumRef.current;
      if (
        minimum !== undefined &&
        natural !== undefined &&
        measurements.current.content <= minimum + 0.5 &&
        natural + 0.5 < measurements.current.content
      ) {
        request.contentBeforeRelease = measurements.current.content;
      }
      cancelAnchor();
      if (!ready() || request.contentBeforeRelease !== undefined) {
        pendingScroll.current = request;
        return;
      }
      pendingScroll.current = undefined;
      listRef.current?.scrollToOffset({
        offset: Math.max(
          0,
          measurements.current.content - measurements.current.viewport
        ),
        animated: request.animated,
      });
      if (measurements.current.content <= measurements.current.viewport)
        publishPosition();
    },
    [
      cancelAnchor,
      cancelPrependPreservation,
      listRef,
      naturalContentHeight,
      publishPosition,
      ready,
    ]
  );

  const itemCount = keys.length;
  const reconcileLayout = useCallback(
    (contentChanged: boolean) => {
      if (!ready()) return;
      if (anchor.current) {
        applyAnchor();
        return;
      }
      const request = pendingScroll.current;
      if (
        request?.contentBeforeRelease !== undefined &&
        measurements.current.content === request.contentBeforeRelease &&
        (naturalContentHeight() ?? 0) < request.contentBeforeRelease
      )
        return;
      if (itemCount > 0 && !initialized.current) {
        initialized.current = true;
        if (request || initial.current === 'end') {
          scrollToEnd(request ?? { animated: false });
          return;
        }
        publishPosition();
        return;
      }
      if (request) {
        scrollToEnd(request);
        return;
      }
      const prepended = prependPending.current;
      if (contentChanged) prependPending.current = false;
      const shouldFollow =
        initialized.current &&
        followOutput === 'whenAtEnd' &&
        !userScrolling.current &&
        !prepended &&
        !preservingPrependRef.current &&
        atEndRef.current;
      if (shouldFollow) scrollToEnd({ animated: false });
      else publishPosition();
    },
    [
      applyAnchor,
      followOutput,
      itemCount,
      naturalContentHeight,
      preservingPrependRef,
      publishPosition,
      ready,
      scrollToEnd,
    ]
  );

  layoutChanged.current = () => {
    if (anchor.current) applyAnchor();
    else if (pendingScroll.current) reconcileLayout(false);
  };

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const movedUp = contentOffset.y < measurements.current.offset;
      const geometryChanged =
        measurements.current.content !== contentSize.height ||
        measurements.current.viewport !== layoutMeasurement.height;
      const request = anchor.current;
      if (request?.offset !== undefined) {
        if (Math.abs(contentOffset.y - request.offset) <= 0.5)
          request.settled = true;
        // RN Web wheel scrolling need not dispatch scrollBeginDrag. Once a
        // requested scroll has settled, a user move at unchanged geometry wins.
        else if (request.settled && !geometryChanged) cancelAnchor();
      }
      const resizingAtEnd =
        !anchor.current &&
        atEndRef.current &&
        !movedUp &&
        !userScrolling.current &&
        followOutput === 'whenAtEnd' &&
        geometryChanged;
      measurements.current = {
        width: layoutMeasurement.width,
        offset: contentOffset.y,
        content: contentSize.height,
        viewport: layoutMeasurement.height,
        hasContentSize: true,
      };
      if (!resizingAtEnd) publishPosition();
    },
    [cancelAnchor, followOutput, publishPosition]
  );

  const onLayout = useCallback(
    ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
      measurements.current.viewport = layout.height;
      measurements.current.width = layout.width;
      reconcileLayout(false);
    },
    [reconcileLayout]
  );
  const onContentSizeChange = useCallback(
    (_width: number, height: number) => {
      measurements.current.content = height;
      measurements.current.hasContentSize = true;
      reconcileLayout(true);
    },
    [reconcileLayout]
  );
  const onUserScrollBegin = useCallback(() => {
    userScrolling.current = true;
    pendingScroll.current = undefined;
    cancelAnchor();
  }, [cancelAnchor]);
  const onMomentumScrollBegin = useCallback(() => {
    userScrolling.current = true;
  }, []);
  const onScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScroll(event);
      if (!event.nativeEvent.velocity?.y) {
        userScrolling.current = false;
        publishPosition();
      }
    },
    [onScroll, publishPosition]
  );
  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScroll(event);
      userScrolling.current = false;
      publishPosition();
    },
    [onScroll, publishPosition]
  );
  const onScrollToIndexFailed = useCallback(
    (
      failure: Parameters<
        NonNullable<FlatListProps<T>['onScrollToIndexFailed']>
      >[0]
    ) => {
      const request = anchor.current;
      if (
        !request ||
        currentKeys.current.indexOf(request.key) !== failure.index ||
        !Number.isFinite(failure.averageItemLength) ||
        failure.averageItemLength <= 0
      )
        return;
      listRef.current?.scrollToOffset({
        offset: failure.index * failure.averageItemLength,
        animated: false,
      });
    },
    [listRef]
  );

  return {
    atEnd,
    anchorMinimumHeight,
    anchorToItem,
    onCellLayout,
    onItemLayout,
    onCellUnmount,
    onFooterLayout,
    onScrollToIndexFailed,
    scrollToEnd,
    onLayout,
    onContentSizeChange,
    onScroll,
    onUserScrollBegin,
    onMomentumScrollBegin,
    onScrollEndDrag,
    onMomentumScrollEnd,
  };
}
