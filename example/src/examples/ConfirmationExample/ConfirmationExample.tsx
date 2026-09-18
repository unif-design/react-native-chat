import { useState } from 'react';
import { Text, View } from 'react-native';
import { useThemedStyles } from '@unif/react-native-design';
import { Confirmation } from '@unif/react-native-chat';
import type { ConfirmationStatus } from '@unif/react-native-chat';
import { createStyles } from './styles';

export function ConfirmationExample() {
  const [status, setStatus] = useState<ConfirmationStatus>('pending');
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Confirmation</Text>
      <Confirmation
        title="确认当前选择"
        status={status}
        onConfirm={() => setStatus('confirmed')}
        onCancel={() => setStatus('cancelled')}
      >
        <Text style={styles.content}>客户：示例客户</Text>
      </Confirmation>
    </View>
  );
}
