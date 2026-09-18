import { useState } from 'react';
import { Text, View } from 'react-native';
import { useThemedStyles } from '@unif/react-native-design';
import { Feedback } from '@unif/react-native-chat';
import { createStyles } from './styles';

export function FeedbackExample() {
  const [message, setMessage] = useState('尚未取得本次请求的最终结果。');
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Feedback</Text>
      <Feedback
        tone="warning"
        title="结果未确认"
        message={message}
        action={{
          id: 'verify',
          label: '核实结果',
          onPress: () => setMessage('已请求核实，等待调用方更新结果。'),
        }}
      />
    </View>
  );
}
