import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ChatAction } from '../../actions';

export type ProcessStepStatus =
  'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ProcessStep {
  id: string;
  title: string;
  status: ProcessStepStatus;
  description?: string;
  elapsedMs?: number;
  details?: ReactNode;
  actions?: readonly ChatAction[];
}

export interface ProcessBaseProps {
  steps: readonly ProcessStep[];
  title?: string;
  identity?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
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
