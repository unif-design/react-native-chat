import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Avatar, useThemedStyles } from '@unif/react-native-design';
import { Chat, Composer, Message, MessageList } from '@unif/react-native-chat';
import type { ChatMessage } from './types';
import { INITIAL_MESSAGES } from './constants';
import { DemoResult } from '../DemoResult';
import { createStyles } from './styles';

export function ChatDemo() {
  const nextMessageId = useRef(1);
  const [draft, setDraft] = useState('明天下午三点提醒我整理周报');
  const [messages, setMessages] =
    useState<readonly ChatMessage[]>(INITIAL_MESSAGES);
  const [result, setResult] = useState('编辑下方草稿，然后发送一条新消息');
  const styles = useThemedStyles(createStyles);

  const send = (value: string) => {
    const id = `local-${nextMessageId.current++}`;
    setMessages((current) => [
      ...current,
      { id, placement: 'end', text: value },
    ]);
    setDraft('');
    setResult(`已记录本地发送事件：${JSON.stringify(value)}`);
  };

  return (
    <View style={styles.root}>
      <View style={styles.frame}>
        <Chat
          style={styles.chat}
          header={
            <View style={styles.header}>
              <Avatar label="AI" size="sm" variant="brand" />
              <View style={styles.headerCopy}>
                <Text style={styles.title}>智能助手</Text>
                <Text style={styles.subtitle}>专注整理今天的事情</Text>
              </View>
            </View>
          }
          composer={
            <Composer
              value={draft}
              onChangeText={setDraft}
              primaryAction={{ kind: 'send', onPress: send }}
              placeholder="输入一条消息"
              surface="plain"
            />
          }
        >
          <MessageList
            items={messages}
            keyExtractor={(message) => message.id}
            renderItem={(message) => (
              <Message
                placement={message.placement}
                text={message.text}
                name={message.placement === 'start' ? '智能助手' : undefined}
              />
            )}
            renderSeparator={() => <View style={styles.separator} />}
            style={styles.messages}
          />
        </Chat>
      </View>
      <DemoResult>{result}</DemoResult>
    </View>
  );
}
