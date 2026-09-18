import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, useThemedStyles } from '@unif/react-native-design';
import { Attachments } from '@unif/react-native-chat';
import type { ChatAttachmentItem } from '@unif/react-native-chat';
import { ATTACHMENT_LAYOUTS, INITIAL_ATTACHMENT_ITEMS } from './constants';
import { createStyles } from './styles';
import type { AttachmentsExampleLayout } from './types';

const createInitialItems = (): ChatAttachmentItem[] =>
  INITIAL_ATTACHMENT_ITEMS.map((item) => ({ ...item }));

export function AttachmentsExample() {
  const [layout, setLayout] = useState<AttachmentsExampleLayout>('grid');
  const [items, setItems] = useState<ChatAttachmentItem[]>(createInitialItems);
  const [lastAction, setLastAction] = useState('等待附件操作');
  const styles = useThemedStyles(createStyles);

  const visibleItems = items.map((item) =>
    item.id === 'failed-file'
      ? {
          ...item,
          actions: [
            {
              id: 'retry',
              label: '记录继续处理',
              icon: 'retry' as const,
              onPress: () => setLastAction(`继续处理原项：${item.id}`),
            },
          ],
        }
      : item
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Attachments</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>四种布局</Text>
        <View style={styles.controls}>
          {ATTACHMENT_LAYOUTS.map((layoutOption) => (
            <Button
              key={layoutOption.value}
              label={layoutOption.label}
              size="sm"
              variant={layout === layoutOption.value ? 'primary' : 'secondary'}
              onPress={() => setLayout(layoutOption.value)}
            />
          ))}
          <Button
            label="重置样例"
            size="sm"
            variant="outline"
            onPress={() => {
              setItems(createInitialItems());
              setLastAction('已重置本地样例项');
            }}
          />
        </View>
        <Text style={styles.note}>
          当前布局：{layout}；包含五种状态、三种忙碌样式，以及已知和未知比例。
        </Text>
      </View>

      <Attachments
        items={visibleItems}
        layout={layout}
        showProgressLabel
        onPreview={(item) =>
          setLastAction(`预览原项：${item.id} / ${item.name ?? '未命名附件'}`)
        }
        onRemove={(item) => {
          setLastAction(`移除原项：${item.id} / ${item.name ?? '未命名附件'}`);
          setItems((current) =>
            current.filter((candidate) => candidate.id !== item.id)
          );
        }}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>事件记录</Text>
        <Text style={styles.result}>{lastAction}</Text>
        <Text style={styles.note}>
          图片使用固定 data
          URI；预览、移除和继续处理只记录原项，不访问外网或执行业务上传。
        </Text>
      </View>
    </ScrollView>
  );
}
