import { useState } from 'react';
import { Text, View } from 'react-native';
import { useThemedStyles } from '@unif/react-native-design';
import { Citation } from '@unif/react-native-chat';
import { CITATION_DETAILS } from './constants';
import { DemoResult } from '../DemoResult';
import { createStyles } from './styles';

export function CitationDemo() {
  const [selectedId, setSelectedId] = useState<string>();
  const selected = CITATION_DETAILS.find((item) => item.id === selectedId);
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.root}>
      <View style={styles.answer}>
        <Text style={styles.answerTitle}>摘要</Text>
        <Text style={styles.paragraph}>
          团队计划先完成组件文档
          <Citation label="1" onPress={() => setSelectedId('1')} />
          ，再进行窄屏与主题检查
          <Citation label="2" onPress={() => setSelectedId('2')} />。
        </Text>
      </View>
      <DemoResult label={selected ? `引用 ${selected.label}` : '引用详情'}>
        {selected?.description ?? '点击正文中的引用标记'}
      </DemoResult>
    </View>
  );
}
