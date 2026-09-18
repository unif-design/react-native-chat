import { createRef } from 'react';
import { Text, View } from 'react-native';
import { Message, MessageList } from '@unif/react-native-chat';
import type {
  MessageListHandle,
  MessageListProps,
  MessageProps,
} from '@unif/react-native-chat';

interface ExampleMessage {
  id: string;
  text: string;
}

const plainMessage: MessageProps = {
  text: '普通正文',
  numberOfLines: 2,
  placement: 'end',
};
const markdownMessage: MessageProps = {
  text: '[资料](https://example.invalid/reference)',
  format: 'markdown',
  onLinkPress: (url) => url.length,
};
const customMessage: MessageProps = {
  children: <Text>自定义正文</Text>,
  surface: 'plain',
};

const listRef = createRef<MessageListHandle>();
const messages: readonly ExampleMessage[] = [
  { id: 'one', text: '第一条' },
  { id: 'two', text: '第二条' },
];
const listProps: MessageListProps<ExampleMessage> = {
  items: messages,
  keyExtractor: (item) => item.id,
  renderItem: (item, index) => (
    <Message placement={index % 2 === 0 ? 'start' : 'end'} text={item.text} />
  ),
  initialPosition: 'end',
  followOutput: 'whenAtEnd',
  onAtEndChange: (atEnd) => atEnd,
  hasEarlier: true,
  onRequestEarlier: () => undefined,
  header: <Text>外部 header</Text>,
};

export const messageConsumption = (
  <View>
    <Message {...plainMessage} />
    <Message {...markdownMessage} />
    <Message {...customMessage} />
    <MessageList ref={listRef} {...listProps} />
  </View>
);

listRef.current?.scrollToEnd({ animated: false });

export const invalidMarkdownLines = (
  // @ts-expect-error Markdown 正文不接收普通文本的 numberOfLines。
  <Message text="Markdown" format="markdown" numberOfLines={2} />
);

export const invalidMixedContent = (
  // @ts-expect-error 自定义 children 与 text 正文互斥。
  <Message text="普通正文">
    <Text>自定义正文</Text>
  </Message>
);

export const invalidInitialPosition = (
  // @ts-expect-error MessageList 只接受 start 或 end 初始位置。
  <MessageList {...listProps} initialPosition="latest" />
);
