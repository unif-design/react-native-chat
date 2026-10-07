import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ChatAction } from '../../actions';

export type ProcessStepStatus =
  'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ProcessStep {
  id: string;
  title: string;
  status: ProcessStepStatus;
  /** 调用者提供的状态显示文案；不改变 status 的语义。 */
  statusText?: string;
  description?: string;
  elapsedMs?: number;
  details?: ReactNode;
  actions?: readonly ChatAction[];
}

export interface ProcessBaseProps {
  /** card 为状态面板；compact 为单行过程；timeline 为带状态节点的连续步骤。 */
  variant?: 'card' | 'compact' | 'timeline';
  steps: readonly ProcessStep[];
  title?: string;
  identity?: ReactNode;
  /** inline 仅用于 compact 单项，让身份与状态处于同一行。 */
  identityPlacement?: 'heading' | 'inline';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface ProcessCompactStepProps {
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
