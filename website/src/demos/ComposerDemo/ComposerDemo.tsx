import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@unif/react-native-design';
import { Composer } from '@unif/react-native-chat';
import type { ComposerPrimaryAction } from '@unif/react-native-chat';
import { INITIAL_COMPOSER_VALUE } from './constants';
import { DemoResult } from '../DemoResult';
import { styles } from './styles';
import type { ComposerDemoMode } from './types';

export function ComposerDemo() {
  const [value, setValue] = useState(INITIAL_COMPOSER_VALUE);
  const [mode, setMode] = useState<ComposerDemoMode>('send');
  const [result, setResult] = useState('编辑这段文字，然后试试发送或停止');

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
          label={mode === 'send' ? '切换到停止状态' : '恢复发送状态'}
          size="sm"
          variant="text"
          onPress={() =>
            setMode((current) => (current === 'send' ? 'stop' : 'send'))
          }
        />
      </View>
      <DemoResult>{result}</DemoResult>
    </View>
  );
}
