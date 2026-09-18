import { useState } from 'react';
import { Text, View } from 'react-native';
import { useThemedStyles } from '@unif/react-native-design';
import { Citation } from '@unif/react-native-chat';
import { createStyles } from './styles';

export function CitationExample() {
  const [selected, setSelected] = useState('未打开');
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Citation</Text>
      <Text style={styles.paragraph}>
        该结论来自当前客户资料
        <Citation label="1" onPress={() => setSelected('来源 1')} />。
      </Text>
      <Text style={styles.result}>{selected}</Text>
    </View>
  );
}
