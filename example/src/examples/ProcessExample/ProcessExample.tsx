import { useState } from 'react';
import { Text, View } from 'react-native';
import { useThemedStyles } from '@unif/react-native-design';
import { Process } from '@unif/react-native-chat';
import { createStyles } from './styles';

export function ProcessExample() {
  const [lastAction, setLastAction] = useState('尚未操作');
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Process</Text>
      <Process
        title="处理进度"
        steps={[
          {
            id: 'read',
            title: '读取附件',
            status: 'completed',
            elapsedMs: 860,
          },
          {
            id: 'understand',
            title: '理解输入',
            status: 'running',
            details: <Text style={styles.details}>只展示公开过程说明。</Text>,
          },
          {
            id: 'query',
            title: '查询资料',
            status: 'failed',
            actions: [
              {
                id: 'retry',
                label: '重新查询',
                onPress: () => setLastAction('已请求重新查询'),
              },
            ],
          },
        ]}
      />
      <Text style={styles.result}>{lastAction}</Text>
    </View>
  );
}
