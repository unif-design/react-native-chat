import type { RefObject } from 'react';

export interface WebRectLike {
  top: number;
  bottom: number;
}

export interface WebEventListenerOptions {
  capture?: boolean;
  passive?: boolean;
}

export interface WebElementLike {
  id: string;
  scrollTop: number;
  scrollHeight: number;
  getBoundingClientRect(): WebRectLike;
  querySelectorAll(selector: string): ArrayLike<unknown>;
  contains(candidate: unknown): boolean;
  addEventListener(
    type: string,
    listener: () => void,
    options?: WebEventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: () => void,
    options?: WebEventListenerOptions
  ): void;
}

export interface WebObserverLike {
  observe(target: unknown, options?: unknown): void;
  unobserve?(target: unknown): void;
  disconnect(): void;
}

export interface WebObserverConstructor {
  new (callback: () => void): WebObserverLike;
}

export interface WebDocumentLike {
  getElementById(id: string): unknown;
}

export interface WebGlobals {
  document?: WebDocumentLike;
  MutationObserver?: WebObserverConstructor;
  ResizeObserver?: WebObserverConstructor;
  requestAnimationFrame?(callback: () => void): number;
  cancelAnimationFrame?(frame: number): void;
}

export interface WebAnchorSnapshot {
  id: string;
  top: number;
  scrollHeight: number;
  scrollTop: number;
}

export interface WebPrependScrollToOffsetOptions {
  offset: number;
  animated?: boolean;
}

export interface WebPrependAnchorListHandle {
  getScrollableNode(): unknown;
  scrollToOffset(options: WebPrependScrollToOffsetOptions): void;
}

export interface WebPrependAnchorConnection {
  list: WebPrependAnchorListHandle;
  scroller: WebElementLike;
  mutationObserver?: WebObserverLike;
  resizeObserver?: WebObserverLike;
  resizeTargets: Set<WebElementLike>;
  userInteraction(): void;
  scroll(): void;
}

export interface UseWebPrependAnchorOptions {
  listRef: RefObject<WebPrependAnchorListHandle | null>;
  itemsIdentity: unknown;
  keys: readonly string[];
}

export interface WebPrependAnchorHandle {
  rowNativeIDPrefix: string;
  getRowNativeID(key: string): string;
  preservingPrependRef: RefObject<boolean>;
  cancelPrependPreservation(): void;
}
