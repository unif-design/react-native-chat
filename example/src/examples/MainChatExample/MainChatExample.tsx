import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import {
  Attachments,
  Chat,
  Composer,
  Feedback,
  Message,
  MessageList,
  Suggestions,
} from '@unif/react-native-chat';
import type { ChatAttachmentItem } from '@unif/react-native-chat';
import { styles } from './styles';
import type { ExampleMessage } from './types';

export function MainChatExample() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ExampleMessage[]>([]);
  const [attachments, setAttachments] = useState<ChatAttachmentItem[]>([]);
  const nextId = useRef(0);
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Chat
        style={styles.chat}
        header={
          <Feedback message="发送只追加本地样例消息；草稿与附件由本例持有。" />
        }
        composer={
          <Composer
            value={text}
            onChangeText={setText}
            header={
              <Attachments
                items={attachments}
                onRemove={(item) =>
                  setAttachments((current) =>
                    current.filter((candidate) => candidate.id !== item.id)
                  )
                }
              />
            }
            actions={[
              {
                id: 'sample',
                label: '添加样例附件',
                icon: 'file',
                onPress: () =>
                  setAttachments((current) => [
                    ...current,
                    {
                      id: `file-${++nextId.current}`,
                      name: '样例文档',
                      kind: 'file',
                      status: 'ready',
                      removable: true,
                    },
                  ]),
              },
            ]}
            primaryAction={{
              kind: 'send',
              allowEmpty: attachments.length > 0,
              onPress(value) {
                const id = `message-${++nextId.current}`;
                setMessages((current) => [
                  ...current,
                  { id, text: value || `样例附件 ${attachments.length} 个` },
                ]);
                setText('');
                setAttachments([]);
              },
            }}
          />
        }
      >
        <MessageList
          items={messages}
          keyExtractor={(item) => item.id}
          renderItem={(item) => <Message placement="end" text={item.text} />}
          empty={
            <Suggestions
              items={[{ id: 'greeting', label: '你好，开始验证组件' }]}
              onSelect={(item) => setText(item.label)}
            />
          }
        />
      </Chat>
    </KeyboardAvoidingView>
  );
}
