import { useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, useThemedStyles } from '@unif/react-native-design';
import { Composer } from '@unif/react-native-chat';
import type {
  ComposerHandle,
  ComposerPrimaryAction,
  ComposerVoiceControl,
} from '@unif/react-native-chat';
import { LONG_COMPOSER_TEXT, PRIMARY_MODES, VOICE_STATUSES } from './constants';
import { createStyles } from './styles';
import type { ComposerExampleVoiceStatus, ComposerPrimaryMode } from './types';

export function ComposerExample() {
  const composerRef = useRef<ComposerHandle>(null);
  const [value, setValue] = useState('');
  const [allowEmpty, setAllowEmpty] = useState(false);
  const [primaryMode, setPrimaryMode] = useState<ComposerPrimaryMode>('send');
  const [voiceStatus, setVoiceStatus] =
    useState<ComposerExampleVoiceStatus>('idle');
  const [lastAction, setLastAction] = useState('等待操作');
  const [focused, setFocused] = useState(false);
  const [height, setHeight] = useState<number>();
  const styles = useThemedStyles(createStyles);

  const primaryAction: ComposerPrimaryAction =
    primaryMode === 'send'
      ? {
          kind: 'send',
          allowEmpty,
          onPress: (currentValue) =>
            setLastAction(`发送事件原文：${JSON.stringify(currentValue)}`),
        }
      : primaryMode === 'stop'
        ? {
            kind: 'stop',
            onPress: () => setLastAction('收到停止回复事件'),
          }
        : { kind: 'busy' };

  const voice: ComposerVoiceControl = {
    status: voiceStatus,
    transcript:
      voiceStatus === 'listening' || voiceStatus === 'finishing'
        ? '外部提供的识别中文字'
        : undefined,
    onStart: () => {
      setVoiceStatus('starting');
      setLastAction('收到开始语音事件');
    },
    onStop: () => {
      setVoiceStatus('finishing');
      setLastAction('收到停止语音事件');
    },
    onCancel: () => {
      setVoiceStatus('idle');
      setLastAction('收到取消语音事件');
    },
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.title}>Composer</Text>
      <Text style={styles.note}>
        空值未聚焦时为单行；聚焦或输入文字后展开。语音控件只演示状态与事件。
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>受控文字与高度</Text>
        <View style={styles.controls}>
          <Button
            label="载入长文"
            size="sm"
            variant="secondary"
            onPress={() => setValue(LONG_COMPOSER_TEXT)}
          />
          <Button
            label="清空文字"
            size="sm"
            variant="secondary"
            onPress={() => setValue('')}
          />
          <Button
            label={allowEmpty ? '禁止空值发送' : '允许空值发送'}
            size="sm"
            variant="secondary"
            onPress={() => setAllowEmpty((current) => !current)}
          />
        </View>
        <Text style={styles.note}>
          当前长度：{value.length}；allowEmpty：{allowEmpty ? '是' : '否'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>主动作</Text>
        <View style={styles.controls}>
          {PRIMARY_MODES.map((mode) => (
            <Button
              key={mode.value}
              label={mode.label}
              size="sm"
              variant={primaryMode === mode.value ? 'primary' : 'secondary'}
              onPress={() => setPrimaryMode(mode.value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>语音显示状态</Text>
        <View style={styles.controls}>
          {VOICE_STATUSES.map((voiceOption) => (
            <Button
              key={voiceOption.value}
              label={voiceOption.label}
              size="sm"
              variant={
                voiceStatus === voiceOption.value ? 'primary' : 'secondary'
              }
              onPress={() => setVoiceStatus(voiceOption.value)}
            />
          ))}
        </View>
        <Text style={styles.note}>
          这里仅切换外部状态投影，不启动真实麦克风。
        </Text>
      </View>

      <Composer
        ref={composerRef}
        value={value}
        onChangeText={setValue}
        primaryAction={primaryAction}
        voice={voice}
        actions={[
          {
            id: 'capture',
            label: '记录拍照请求',
            icon: 'camera',
            onPress: () => setLastAction('收到拍照入口事件'),
          },
          {
            id: 'pick-file',
            label: '记录选文件请求',
            icon: 'paperclip',
            onPress: () => setLastAction('收到选择文件入口事件'),
          },
        ]}
        onFocusChange={setFocused}
        onHeightChange={setHeight}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ref、焦点与测量记录</Text>
        <View style={styles.controls}>
          <Button
            label="聚焦输入"
            size="sm"
            variant="outline"
            onPress={() => composerRef.current?.focus()}
          />
          <Button
            label="输入失焦"
            size="sm"
            variant="outline"
            onPress={() => composerRef.current?.blur()}
          />
        </View>
        <Text style={styles.result}>焦点：{focused ? '已聚焦' : '未聚焦'}</Text>
        <Text style={styles.result}>Composer 高度：{height ?? '等待测量'}</Text>
        <Text style={styles.result}>{lastAction}</Text>
      </View>
    </ScrollView>
  );
}
