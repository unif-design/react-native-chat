import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@unif/react-native-design';
import { Attachments } from '@unif/react-native-chat';
import type { ChatAttachmentItem } from '@unif/react-native-chat';
import { INITIAL_ATTACHMENTS } from './constants';
import { DemoResult } from '../DemoResult';
import { styles } from './styles';

const createInitialItems = (): ChatAttachmentItem[] =>
  INITIAL_ATTACHMENTS.map((item) => ({ ...item }));

export function AttachmentsDemo() {
  const [items, setItems] = useState<ChatAttachmentItem[]>(createInitialItems);
  const [result, setResult] = useState('点击图片预览，或移除任一可移除附件');

  const visibleItems = items.map((item) =>
    item.id === 'brief'
      ? {
          ...item,
          actions: [
            {
              id: 'continue',
              label: '继续处理',
              onPress: () => setResult(`已记录附件操作：${item.name}`),
            },
          ],
        }
      : item
  );

  return (
    <View style={styles.root}>
      <Attachments
        items={visibleItems}
        layout="mixed"
        showProgressLabel
        onPreview={(item) => setResult(`预览原项：${item.name ?? item.id}`)}
        onRemove={(item) => {
          setItems((current) =>
            current.filter((candidate) => candidate.id !== item.id)
          );
          setResult(`移除原项：${item.name ?? item.id}`);
        }}
      />
      {items.length < INITIAL_ATTACHMENTS.length ? (
        <View style={styles.restore}>
          <Button
            label="恢复附件"
            size="sm"
            variant="text"
            onPress={() => {
              setItems(createInitialItems());
              setResult('已恢复本地附件样例');
            }}
          />
        </View>
      ) : null}
      <DemoResult>{result}</DemoResult>
    </View>
  );
}
