import { createRef } from 'react';
import { MessageList } from '@unif/react-native-chat';
import type {
  MessageListAnchorOptions,
  MessageListHandle,
} from '@unif/react-native-chat';
import { Text } from 'react-native';

const ref = createRef<MessageListHandle>();
const options: MessageListAnchorOptions = { topOffset: 8, animated: false };
export const anchoredList = (
  <MessageList
    ref={ref}
    items={[{ id: 'stable-id', text: '外部消息' }]}
    keyExtractor={(item) => item.id}
    renderItem={(item) => <Text>{item.text}</Text>}
    followOutput="never"
  />
);
ref.current?.anchorToItem('stable-id', options);
ref.current?.scrollToEnd();
// @ts-expect-error 顶锚只接受稳定 key，不使用可能变化的业务行索引。
ref.current?.anchorToItem(3);
// @ts-expect-error 布局留白使用数值，不传屏幕坐标字符串。
ref.current?.anchorToItem('stable-id', { topOffset: '8px' });
