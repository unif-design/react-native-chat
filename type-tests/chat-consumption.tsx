import { Text } from 'react-native';
import { Chat } from '@unif/react-native-chat';
import type { ChatProps } from '@unif/react-native-chat';
export const chatProps: ChatProps = {
  children: <Text>独立内容</Text>,
  bottomInset: 12,
};
export const chatConsumption = <Chat {...chatProps} />;
// @ts-expect-error Chat 的消息内容位置是必填字段。
export const missingContent: ChatProps = { bottomInset: 12 };
