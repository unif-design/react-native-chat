import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { IconName, TextFieldHandle } from '@unif/react-native-design';
import type { ChatAction } from '../../actions';

export interface ComposerSendAction {
  kind: 'send';
  onPress(value: string): void;
  allowEmpty?: boolean;
  disabled?: boolean;
  /** 图标按钮的可访问名称，默认“发送”。 */
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
  /** card 提供统一表面；plain 由外层提供表面，内部 Textarea 均不单独绘制表面。 */
  surface?: 'card' | 'plain';
  /** Textarea 整体最小高度（含内间距），默认 44，不低于最小触达高度。 */
  minInputHeight?: number;
  /** Textarea 整体最大高度；默认四行文字预算加 plain 内间距，随应用字号变化。 */
  maxInputHeight?: number;
  onFocusChange?(focused: boolean): void;
  onHeightChange?(height: number): void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export type ComposerHandle = TextFieldHandle;

export interface ComposerIconActionProps {
  icon: IconName;
  label: string;
  onPress?(): void;
  disabled?: boolean;
  busy?: boolean;
  expanded?: boolean;
  visual?: 'icon' | 'primary' | 'cancel';
}

export interface ComposerMenuItemProps {
  action: ChatAction;
  disabled: boolean;
  onPress(): void;
}
