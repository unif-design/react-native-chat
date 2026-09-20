import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, useThemedStyles } from '@unif/react-native-design';
import { Composer } from '@unif/react-native-chat';
import type { ComposerPrimaryAction } from '@unif/react-native-chat';
import { INITIAL_COMPOSER_VALUE } from './constants';
import { DemoResult } from '../DemoResult';
import { createStyles } from './styles';
import type { ComposerDemoMode } from './types';

export function ComposerDemo() {
  const styles = useThemedStyles(createStyles);
  const [value, setValue] = useState(INITIAL_COMPOSER_VALUE);
  const [mode, setMode] = useState<ComposerDemoMode>('send');
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState(
    '聚焦后展开；输入文字后可发送，发送事件保留原文'
  );

  const primaryAction: ComposerPrimaryAction =
    mode === 'send'
      ? {
          kind: 'send',
          onPress: (originalValue) =>
            setResult(`发送事件原文：${JSON.stringify(originalValue)}`),
        }
      : {
          kind: 'stop',
          onPress: () => setResult('已收到独立的停止事件'),
        };

  return (
    <View style={styles.root}>
      <Composer
        value={value}
        onChangeText={setValue}
        primaryAction={primaryAction}
        voice={{
          status: listening ? 'listening' : 'idle',
          transcript: listening ? '调用方提供的识别文字' : undefined,
          onStart: () => {
            setListening(true);
            setResult('展示聆听状态；示例未启动麦克风');
          },
          onStop: () => {
            setListening(false);
            setResult('收到停止语音事件，草稿保持原文');
          },
          onCancel: () => {
            setListening(false);
            setResult('收到取消语音事件，草稿保持原文');
          },
        }}
        actions={[
          {
            id: 'photo',
            label: '选择照片',
            icon: 'camera',
            onPress: () => setResult('已收到选择照片入口事件'),
          },
          {
            id: 'file',
            label: '选择文件',
            icon: 'paperclip',
            onPress: () => setResult('已收到选择文件入口事件'),
          },
        ]}
      />
      <View style={styles.controls}>
        <Button
          label="清空文字"
          size="sm"
          variant="text"
          onPress={() => setValue('')}
        />
        <Button
          label={mode === 'send' ? '切换到停止状态' : '恢复发送状态'}
          size="sm"
          variant="text"
          onPress={() =>
            setMode((current) => (current === 'send' ? 'stop' : 'send'))
          }
        />
      </View>
      <Text style={styles.note}>语音按钮演示外部状态，不录音。</Text>
      <DemoResult>{result}</DemoResult>
    </View>
  );
}
