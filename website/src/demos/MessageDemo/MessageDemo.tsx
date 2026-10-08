import { useState } from 'react';
import { Text, View } from 'react-native';
import { Avatar, Button, useThemedStyles } from '@unif/react-native-design';
import { Message, MessageWaiting, Process } from '@unif/react-native-chat';
import { MARKDOWN_MESSAGE } from './constants';
import { DemoResult } from '../DemoResult';
import { createStyles } from './styles';

export function MessageDemo() {
  const [replyReady, setReplyReady] = useState(false);
  const [result, setResult] = useState('试试链接、复制回答或卡片操作');
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.root}>
      <Message
        avatar={<Avatar label="AI" size="sm" variant="brand" />}
        name="智能助手"
        format="markdown"
        text={MARKDOWN_MESSAGE}
        onLinkPress={(url) => setResult(`链接事件：${url}`)}
        actions={[
          {
            id: 'copy',
            label: '复制回答',
            icon: 'copy',
            onPress: () => setResult('已收到复制回答事件'),
          },
        ]}
      />
      <Message
        surface="outlined"
        fullWidth
        onPress={() => setResult('已点击卡片外壳')}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>继续整理这份提纲？</Text>
          <Text style={styles.cardText}>选择保留提纲，稍后继续补充内容。</Text>
          <View style={styles.cardAction}>
            <Button
              label="保留提纲"
              size="sm"
              onPress={() => setResult('已点击嵌套按钮：保留提纲')}
            />
          </View>
        </View>
      </Message>
      <Message
        status="pending"
        statusText="正在提交输入"
        avatar={<Avatar label="AI" size="sm" variant="brand" />}
      />
      <Message
        placement="end"
        text="尚未送出的输入"
        status="failed"
        failureAction={{
          id: 'retry',
          label: '继续原输入',
          onPress: () => setResult('已交付继续原输入事件'),
        }}
      />
      <Message
        fullWidth
        status={replyReady ? 'idle' : 'streaming'}
        header={
          <Process
            variant="compact"
            steps={[
              {
                id: 'reply',
                title: '回复过程',
                status: replyReady ? 'completed' : 'running',
                details: (
                  <Text style={styles.cardText}>
                    这里保留已收到的公开说明。
                  </Text>
                ),
              },
            ]}
          />
        }
        {...(replyReady
          ? {
              text: '**正文已到达**，过程详情仍保留原来的展开状态。',
              format: 'markdown' as const,
            }
          : { children: <MessageWaiting /> })}
      />
      <Button
        label={replyReady ? '重新等待' : '显示正文'}
        size="sm"
        variant="secondary"
        onPress={() => setReplyReady((current) => !current)}
      />
      <DemoResult>{result}</DemoResult>
    </View>
  );
}
