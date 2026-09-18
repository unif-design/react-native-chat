import type { MessagePlacement, MessageStatus } from '@unif/react-native-chat';

export interface DemoListMessage {
  id: string;
  placement: MessagePlacement;
  text: string;
  status?: MessageStatus;
}
