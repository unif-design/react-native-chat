import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { TextFieldHandle } from '@unif/react-native-design';
import type { ChatAction } from '../../actions';

export interface ComposerSendAction {
  kind: 'send';
  onPress(value: string): void;
  allowEmpty?: boolean;
  disabled?: boolean;
  label?: string;
}

export interface ComposerStopAction {
  kind: 'stop';
  onPress(): void;
  disabled?: boolean;
  label?: string;
}

export interface ComposerBusyAction {
  kind: 'busy';
  label?: string;
}

export type ComposerPrimaryAction =
  ComposerSendAction | ComposerStopAction | ComposerBusyAction;
export type ComposerVoiceStatus =
  'idle' | 'starting' | 'listening' | 'finishing';

export interface ComposerVoiceControl {
  status: ComposerVoiceStatus;
  transcript?: string;
  disabled?: boolean;
  onStart(): void;
  onStop(): void;
  onCancel(): void;
}

export interface ComposerProps {
  value: string;
  onChangeText(value: string): void;
  primaryAction: ComposerPrimaryAction;
  editable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  inputAccessibilityLabel?: string;
  actions?: readonly ChatAction[];
  voice?: ComposerVoiceControl;
  header?: ReactNode;
  footer?: ReactNode;
  surface?: 'card' | 'plain';
  minInputHeight?: number;
  maxInputHeight?: number;
  onFocusChange?(focused: boolean): void;
  onHeightChange?(height: number): void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export type ComposerHandle = TextFieldHandle;
