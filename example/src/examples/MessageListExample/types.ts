import type { MessagePlacement, MessageStatus } from '@unif/react-native-chat';

export interface MessageListExampleItem {
  id: string;
  text: string;
  placement: MessagePlacement;
  status?: MessageStatus;
}

export type MessageListInitialPosition = 'start' | 'end';
export type MessageListFollowOutput = 'whenAtEnd' | 'never';
