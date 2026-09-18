import { useState } from 'react';
import { Text, View } from 'react-native';
import { useThemedStyles } from '@unif/react-native-design';
import { Sources } from '@unif/react-native-chat';
import { createStyles } from './styles';

export function SourcesExample() {
  const [selected, setSelected] = useState('未选择');
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Sources</Text>
      <Sources
        items={[
          { id: 'customer', label: '1', title: '当前客户资料' },
          { id: 'order', label: '2', description: '调用方仅提供了说明。' },
        ]}
        onPress={(item) => setSelected(item.id)}
      />
      <Text style={styles.result}>当前来源：{selected}</Text>
    </View>
  );
}
