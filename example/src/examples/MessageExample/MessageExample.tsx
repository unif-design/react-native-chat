import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, useThemedStyles } from '@unif/react-native-design';
import { Message } from '@unif/react-native-chat';
import {
  LONG_PLAIN_MESSAGE,
  MARKDOWN_DEMO_TEXT,
  STREAM_MESSAGE_CHUNKS,
} from './constants';
import { createStyles } from './styles';

export function MessageExample() {
  const [streamText, setStreamText] = useState('累计正文：');
  const [nextChunkIndex, setNextChunkIndex] = useState(0);
  const [lastAction, setLastAction] = useState('等待消息操作');
  const styles = useThemedStyles(createStyles);

  const appendNextChunk = () => {
    const nextChunk = STREAM_MESSAGE_CHUNKS[nextChunkIndex];
    if (!nextChunk) {
      setLastAction('固定增量已经全部采用');
      return;
    }
    setStreamText((current) => current + nextChunk);
    setNextChunkIndex((current) => current + 1);
    setLastAction(`外部采用增量 ${nextChunkIndex + 1}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Message</Text>

      <Text style={styles.sectionTitle}>普通正文与 idle 状态</Text>
      <Message
        placement="end"
        name="示例用户"
        text={LONG_PLAIN_MESSAGE}
        numberOfLines={5}
      />

      <Text style={styles.sectionTitle}>四种状态</Text>
      <Message text="普通空闲消息" status="idle" />
      <Message text="" status="pending" statusText="等待正文" />
      <Message
        text={streamText}
        status="streaming"
        statusText="外部仍在更新累计全文"
      />
      <Message
        text="已保留的部分正文"
        status="failed"
        statusText="结果未完整取得"
      />
      <View style={styles.controls}>
        <Button label="追加下一段" size="sm" onPress={appendNextChunk} />
        <Button
          label="重置累计正文"
          size="sm"
          variant="secondary"
          onPress={() => {
            setStreamText('累计正文：');
            setNextChunkIndex(0);
            setLastAction('已重置累计正文');
          }}
        />
      </View>

      <Text style={styles.sectionTitle}>Markdown 长文</Text>
      <Message
        format="markdown"
        fullWidth
        surface="outlined"
        text={MARKDOWN_DEMO_TEXT}
        onLinkPress={(url) => setLastAction(`链接事件：${url}`)}
      />

      <Text style={styles.sectionTitle}>自定义内容与内外点击</Text>
      <Message
        surface="plain"
        onPress={() => setLastAction('消息外壳点击事件')}
      >
        <View style={styles.customCard}>
          <Text style={styles.customTitle}>自定义业务卡片</Text>
          <Text style={styles.customText}>
            卡片按钮和消息外壳分别记录事件，不执行领域操作。
          </Text>
          <Button
            label="业务卡片按钮"
            size="sm"
            onPress={() => setLastAction('业务卡片按钮事件')}
          />
        </View>
      </Message>

      <Text style={styles.result}>{lastAction}</Text>
    </ScrollView>
  );
}
