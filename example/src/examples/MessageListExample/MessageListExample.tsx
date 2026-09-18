import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Button, useThemedStyles } from '@unif/react-native-design';
import { Feedback, Message, MessageList } from '@unif/react-native-chat';
import type { MessageListHandle } from '@unif/react-native-chat';
import {
  EARLIER_MESSAGE_ITEMS,
  FIXED_MESSAGE_ITEMS,
  STREAM_GROWTH_CHUNKS,
} from './constants';
import { createStyles } from './styles';
import type {
  MessageListExampleItem,
  MessageListFollowOutput,
  MessageListInitialPosition,
} from './types';

const createInitialItems = (): MessageListExampleItem[] =>
  FIXED_MESSAGE_ITEMS.map((item) => ({ ...item }));

export function MessageListExample() {
  const listRef = useRef<MessageListHandle>(null);
  const nextMessageId = useRef(1);
  const [items, setItems] =
    useState<MessageListExampleItem[]>(createInitialItems);
  const [hasEarlier, setHasEarlier] = useState(true);
  const [followOutput, setFollowOutput] =
    useState<MessageListFollowOutput>('whenAtEnd');
  const [initialPosition, setInitialPosition] =
    useState<MessageListInitialPosition>('end');
  const [instanceKey, setInstanceKey] = useState(0);
  const [streamChunkIndex, setStreamChunkIndex] = useState(0);
  const [atEnd, setAtEnd] = useState(true);
  const [historyError, setHistoryError] = useState<string>();
  const [lastAction, setLastAction] = useState('等待列表操作');
  const styles = useThemedStyles(createStyles);

  const requestEarlier = () => {
    if (!hasEarlier) return;
    setItems((current) => [
      ...EARLIER_MESSAGE_ITEMS.map((item) => ({ ...item })),
      ...current,
    ]);
    setHasEarlier(false);
    setLastAction(`明确前插 ${EARLIER_MESSAGE_ITEMS.length} 条固定消息`);
  };

  const appendMessage = () => {
    const id = `appended-${nextMessageId.current++}`;
    setItems((current) => [
      ...current,
      {
        id,
        text: `追加消息 ${id}：由本地按钮加入末尾。`,
        placement: 'end',
        status: 'idle',
      },
    ]);
    setLastAction(`追加末尾消息 ${id}`);
  };

  const growStreamingMessage = () => {
    const nextChunk = STREAM_GROWTH_CHUNKS[streamChunkIndex];
    if (!nextChunk) {
      setLastAction('固定流式增量已经全部采用');
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.id === 'streaming-message'
          ? { ...item, text: item.text + nextChunk }
          : item
      )
    );
    setStreamChunkIndex((current) => current + 1);
    setLastAction(`流式行采用增量 ${streamChunkIndex + 1}`);
  };

  const rebuildAt = (position: MessageListInitialPosition) => {
    setInitialPosition(position);
    setInstanceKey((current) => current + 1);
    setLastAction(`以 ${position} 初始位置重建列表实例`);
  };

  const resetItems = () => {
    setItems(createInitialItems());
    setHasEarlier(true);
    setStreamChunkIndex(0);
    setHistoryError(undefined);
    setInstanceKey((current) => current + 1);
    setLastAction('已恢复 121 条固定消息');
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>MessageList</Text>
      <View style={styles.controls}>
        <Button
          label="前插更早消息"
          size="sm"
          disabled={!hasEarlier}
          onPress={requestEarlier}
        />
        <Button label="追加消息" size="sm" onPress={appendMessage} />
        <Button label="增长流式行" size="sm" onPress={growStreamingMessage} />
        <Button
          label={followOutput === 'never' ? '启用末尾跟随' : '切换为 never'}
          size="sm"
          variant="secondary"
          onPress={() =>
            setFollowOutput((current) =>
              current === 'never' ? 'whenAtEnd' : 'never'
            )
          }
        />
        <Button
          label="以 start 重建"
          size="sm"
          variant="secondary"
          onPress={() => rebuildAt('start')}
        />
        <Button
          label="以 end 重建"
          size="sm"
          variant="secondary"
          onPress={() => rebuildAt('end')}
        />
        <Button
          label="ref 滚到末尾"
          size="sm"
          variant="outline"
          onPress={() => listRef.current?.scrollToEnd()}
        />
        <Button
          label={historyError ? '清除历史错误' : '显示历史错误'}
          size="sm"
          variant="outline"
          onPress={() =>
            setHistoryError((current) =>
              current ? undefined : '读取更早消息失败，当前消息保持不变。'
            )
          }
        />
        <Button
          label="重置 121 条"
          size="sm"
          variant="outline"
          onPress={resetItems}
        />
      </View>
      <Text style={styles.status}>
        {items.length} 条；followOutput={followOutput}；初始位置=
        {initialPosition}； 当前{atEnd ? '在末尾' : '离开末尾'}；{lastAction}
      </Text>

      <View style={styles.listFrame}>
        <MessageList
          key={`${instanceKey}-${initialPosition}`}
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
          initialPosition={initialPosition}
          followOutput={followOutput}
          onAtEndChange={setAtEnd}
          hasEarlier={hasEarlier}
          onRequestEarlier={requestEarlier}
          header={
            <View style={styles.header}>
              <Text style={styles.headerText}>
                外部 header：历史错误不会清空已显示集合。
              </Text>
              {historyError ? (
                <Feedback tone="error" message={historyError} />
              ) : null}
            </View>
          }
          footer={<Text style={styles.footer}>固定消息列表末尾</Text>}
          style={styles.list}
        />
      </View>
    </View>
  );
}
