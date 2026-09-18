import { useState } from 'react';
import { View } from 'react-native';
import { Sources } from '@unif/react-native-chat';
import { SOURCE_ITEMS } from './constants';
import { DemoResult } from '../DemoResult';
import { styles } from './styles';

export function SourcesDemo() {
  const [selectedId, setSelectedId] = useState<string>();
  const selected = SOURCE_ITEMS.find((item) => item.id === selectedId);

  return (
    <View style={styles.root}>
      <Sources
        title="本次回答参考"
        items={SOURCE_ITEMS}
        onPress={(item) => setSelectedId(item.id)}
      />
      <DemoResult label="当前来源">
        {selected
          ? `${selected.label} · ${selected.title}`
          : '点击一条来源查看选择结果'}
      </DemoResult>
    </View>
  );
}
