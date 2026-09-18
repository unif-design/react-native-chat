import type { MessagePlacement } from '@unif/react-native-chat';

export interface ChatMessage {
  id: string;
  placement: MessagePlacement;
  text: string;
}
