import type { ComponentType } from 'react';
import type { IconProps } from '@unif/react-native-icons';
import type { ReactNode } from 'react';

import type { StyleProp, ViewStyle } from 'react-native';
import type { ChatAction } from '../../actions';

export type ProcessStepStatus =
  'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ProcessStep {
  id: string;
  title: string;
  status: ProcessStepStatus;
  /** compact / trace 的活动图标；null 不显示，省略时沿状态呈现。 */
  icon?: ComponentType<IconProps> | null;
  /** 调用者提供的状态显示文案；不改变 status 的语义。 */
  statusText?: string;
  /** trace 中显示的来源标签，由调用方提供，如“本机”。 */
  sourceLabel?: string;
  description?: string;
  elapsedMs?: number;
  details?: ReactNode;
  actions?: readonly ChatAction[];
}

export interface ProcessBaseProps {
  /** card 为状态面板；compact 为单行过程；timeline 为连续步骤；trace 为透明工具行。 */
  variant?: 'card' | 'compact' | 'timeline' | 'trace';
  /** compact 文字密度；dense 用于与行内文字相邻的公开过程。 */
  compactDensity?: 'comfortable' | 'dense';
  steps: readonly ProcessStep[];
  title?: string;
  identity?: ReactNode;
  /** inline 仅用于 compact 单项，让身份与状态处于同一行。 */
  identityPlacement?: 'heading' | 'inline';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface ProcessCompactStepProps {
  dense?: boolean;
  identity?: ReactNode;
  step: ProcessStep;
  expanded: boolean;
  elapsed?: string;
  onToggle(): void;
}

export interface ProcessControlledExpansion {
  expandedIds: readonly string[];
  onExpandedChange(ids: readonly string[]): void;
  defaultExpandedIds?: never;
}

export interface ProcessLocalExpansion {
  expandedIds?: never;
  defaultExpandedIds?: readonly string[];
  onExpandedChange?(ids: readonly string[]): void;
}

export type ProcessProps = ProcessBaseProps &
  (ProcessControlledExpansion | ProcessLocalExpansion);
