export interface ProcessingProgressProps {
  /** 当前公开进度；文案和展示结束时机由调用方提供。 */
  progress: string;
}

export interface ProcessingProgressPrefixProps {
  text: string;
  reducedMotion: boolean;
}
