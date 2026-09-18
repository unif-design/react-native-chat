import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Button, useThemedStyles } from '@unif/react-native-design';
import { Message, MessageList } from '@unif/react-native-chat';
import type { MessageListHandle } from '@unif/react-native-chat';
import { EARLIER_MESSAGES, INITIAL_MESSAGES } from './constants';
import { DemoResult } from '../DemoResult';
import { createStyles } from './styles';
import type { DemoListMessage } from './types';

export function MessageListDemo() {
  const listRef = useRef<MessageListHandle>(null);
  const nextId = useRef(1);
  const [items, setItems] =
    useState<readonly DemoListMessage[]>(INITIAL_MESSAGES);
  const [hasEarlier, setHasEarlier] = useState(true);
  const [result, setResult] = useState('列表初始定位在最新消息');
  const styles = useThemedStyles(createStyles);

  const requestEarlier = () => {
    setItems((current) => [...EARLIER_MESSAGES, ...current]);
    setHasEarlier(false);
    setResult(`已前插 ${EARLIER_MESSAGES.length} 条更早消息`);
  };

  const appendMessage = () => {
    const sequence = nextId.current++;
    setItems((current) => [
      ...current,
      {
        id: `new-${sequence}`,
        placement: 'end',
        text: `这是刚刚追加的本地消息 ${sequence}。`,
      },
    ]);
    setResult(`已在末尾追加消息 ${sequence}`);
  };

  return (
    <View style={styles.root}>
      <View style={styles.frame}>
        <MessageList
          ref={listRef}
          items={items}
          keyExtractor={(item) => item.id}
          renderItem={(item) => (
            <Message
              placement={item.placement}
              text={item.text}
              status={item.status}
            />
          )}
          renderSeparator={() => <View style={styles.separator} />}
          hasEarlier={hasEarlier}
          onRequestEarlier={requestEarlier}
          initialPosition="end"
          followOutput="whenAtEnd"
          style={styles.list}
        />
      </View>
      <View style={styles.controls}>
        <Button label="追加消息" size="sm" onPress={appendMessage} />
        <Button
          label="回到最新"
          size="sm"
          variant="secondary"
          onPress={() => {
            listRef.current?.scrollToEnd();
            setResult('已请求滚动到最新消息');
          }}
        />
        <Text style={styles.count}>{items.length} 条消息</Text>
      </View>
      <DemoResult>{result}</DemoResult>
    </View>
  );
}
