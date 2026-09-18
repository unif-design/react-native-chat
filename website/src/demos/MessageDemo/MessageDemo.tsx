import { useState } from 'react';
import { Text, View } from 'react-native';
import { Avatar, Button, useThemedStyles } from '@unif/react-native-design';
import { Message } from '@unif/react-native-chat';
import { MARKDOWN_MESSAGE } from './constants';
import { DemoResult } from '../DemoResult';
import { createStyles } from './styles';

export function MessageDemo() {
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
      <DemoResult>{result}</DemoResult>
    </View>
  );
}
