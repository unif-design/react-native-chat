import { useState } from 'react';
import { Text, View } from 'react-native';
import { useThemedStyles } from '@unif/react-native-design';
import { Suggestions } from '@unif/react-native-chat';
import { createStyles } from './styles';

export function SuggestionsExample() {
  const [selectedId, setSelectedId] = useState<string>();
  const styles = useThemedStyles(createStyles);
  const items = [
    { id: 'customer', label: '查询客户', selected: selectedId === 'customer' },
    { id: 'order', label: '查看订单', selected: selectedId === 'order' },
    { id: 'busy', label: '同步中', loading: true },
  ] as const;

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Suggestions</Text>
      <Suggestions items={items} onSelect={(item) => setSelectedId(item.id)} />
      <Text style={styles.result}>当前选择：{selectedId ?? '无'}</Text>
    </View>
  );
}
