import { ListOutlined, SparkOutlined } from '@unif/react-native-icons';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, useThemedStyles } from '@unif/react-native-design';
import { Suggestions } from '@unif/react-native-chat';
import { createStyles } from './styles';

export function SuggestionsExample() {
  const [selectedId, setSelectedId] = useState<string>();
  const [selectable, setSelectable] = useState(true);
  const styles = useThemedStyles(createStyles);
  const items = [
    {
      id: 'customer',
      label: '查询客户',
      icon: SparkOutlined,
      selected: selectedId === 'customer',
    },
    {
      id: 'order',
      label: '查看订单',
      icon: ListOutlined,
      selected: selectedId === 'order',
    },
    { id: 'busy', label: '同步中', loading: true },
    { id: 'disabled', label: '暂不可用', disabled: true },
  ] as const;

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Suggestions</Text>
      <Button
        label={selectable ? '切换为静态展示' : '切换为可选择'}
        size="sm"
        variant="secondary"
        onPress={() => setSelectable((current) => !current)}
      />
      <Suggestions
        items={items}
        onSelect={selectable ? (item) => setSelectedId(item.id) : undefined}
      />
      <Text style={styles.result}>当前选择：{selectedId ?? '无'}</Text>
    </View>
  );
}
