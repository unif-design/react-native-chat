import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, useThemedStyles } from '@unif/react-native-design';
import { Confirmation } from '@unif/react-native-chat';
import type { ConfirmationStatus } from '@unif/react-native-chat';
import { CONFIRMATION_TITLE, SUMMARY_META, SUMMARY_TITLE } from './constants';
import { DemoResult } from '../DemoResult';
import { createStyles } from './styles';

export function ConfirmationDemo() {
  const [status, setStatus] = useState<ConfirmationStatus>('pending');
  const [result, setResult] = useState('等待选择');
  const styles = useThemedStyles(createStyles);

  const choose = (nextStatus: 'confirmed' | 'cancelled') => {
    setStatus(nextStatus);
    setResult(nextStatus === 'confirmed' ? '已选择采用草稿' : '已选择稍后处理');
  };

  return (
    <View style={styles.root}>
      <Confirmation
        title={CONFIRMATION_TITLE}
        status={status}
        statusText={
          status === 'confirmed'
            ? '已记录采用选择'
            : status === 'cancelled'
              ? '已记录稍后处理'
              : undefined
        }
        confirmLabel="采用草稿"
        cancelLabel="稍后处理"
        onConfirm={() => choose('confirmed')}
        onCancel={() => choose('cancelled')}
      >
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>{SUMMARY_TITLE}</Text>
          <Text style={styles.summaryText}>{SUMMARY_META}</Text>
        </View>
      </Confirmation>
      {status !== 'pending' ? (
        <View style={styles.reset}>
          <Button
            label="重新选择"
            size="sm"
            variant="text"
            onPress={() => {
              setStatus('pending');
              setResult('等待选择');
            }}
          />
        </View>
      ) : null}
      <DemoResult>{result}</DemoResult>
    </View>
  );
}
