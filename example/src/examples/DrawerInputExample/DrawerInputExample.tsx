import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, useThemedStyles } from '@unif/react-native-design';
import { Attachments, Composer, Feedback } from '@unif/react-native-chat';
import type { ChatAttachmentItem } from '@unif/react-native-chat';
import { createStyles } from './styles';

export function DrawerInputExample() {
  const styles = useThemedStyles(createStyles);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [lastAction, setLastAction] = useState('等待输入操作');
  const [attachments, setAttachments] = useState<ChatAttachmentItem[]>([
    {
      id: 'sample-file',
      name: '样例附件',
      kind: 'file',
      status: 'ready',
      removable: true,
    },
  ]);
  return (
    <View style={styles.root}>
      <Feedback message="抽屉直接组合输入与附件；本例没有订单或业务提交。" />
      <Button label="打开输入抽屉" onPress={() => setOpen(true)} />
      <Text style={styles.title}>{lastAction}</Text>
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <GestureHandlerRootView style={styles.modalRoot}>
          <KeyboardAvoidingView
            style={styles.modal}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <SafeAreaView edges={['bottom']} style={styles.drawer}>
              <Text style={styles.title}>独立抽屉输入</Text>
              <Feedback message={lastAction} />
              <Composer
                value={text}
                onChangeText={setText}
                inputAccessibilityLabel="抽屉消息输入框"
                header={
                  <Attachments
                    items={attachments}
                    layout="carousel"
                    onRemove={(item) => {
                      setAttachments((current) =>
                        current.filter((candidate) => candidate.id !== item.id)
                      );
                      setLastAction('调用方移除了样例项');
                    }}
                  />
                }
                primaryAction={{
                  kind: 'send',
                  allowEmpty: attachments.length > 0,
                  onPress(value) {
                    setLastAction(
                      `收到输入事件：${value}，附件 ${attachments.length} 个`
                    );
                    setText('');
                  },
                }}
              />
              <Button
                label="关闭抽屉"
                variant="secondary"
                onPress={() => setOpen(false)}
              />
            </SafeAreaView>
          </KeyboardAvoidingView>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
}
