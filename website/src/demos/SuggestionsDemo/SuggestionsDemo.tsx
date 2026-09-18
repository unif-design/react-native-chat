import { useState } from 'react';
import { View } from 'react-native';
import { Suggestions } from '@unif/react-native-chat';
import { SUGGESTIONS } from './constants';
import { DemoResult } from '../DemoResult';
import { styles } from './styles';

export function SuggestionsDemo() {
  const [selectedId, setSelectedId] = useState(SUGGESTIONS[0]?.id);

  return (
    <View style={styles.root}>
      <Suggestions
        items={SUGGESTIONS.map((item) => ({
          ...item,
          selected: item.id === selectedId,
        }))}
        onSelect={(item) => setSelectedId(item.id)}
      />
      <DemoResult label="当前选择">
        {SUGGESTIONS.find((item) => item.id === selectedId)?.label}
      </DemoResult>
    </View>
  );
}
