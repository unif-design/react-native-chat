import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@unif/react-native-design';
import { Suggestions } from '@unif/react-native-chat';
import { SUGGESTIONS } from './constants';
import { DemoResult } from '../DemoResult';
import { styles } from './styles';

export function SuggestionsDemo() {
  const [selectedId, setSelectedId] = useState(SUGGESTIONS[0]?.id);
  const [selectable, setSelectable] = useState(true);

  return (
    <View style={styles.root}>
      <Button
        label={selectable ? '切换为静态展示' : '切换为可选择'}
        size="sm"
        variant="secondary"
        onPress={() => setSelectable((current) => !current)}
      />
      <Suggestions
        items={SUGGESTIONS.map((item) => ({
          ...item,
          selected: item.id === selectedId,
        }))}
        onSelect={selectable ? (item) => setSelectedId(item.id) : undefined}
      />
      <DemoResult label="当前选择">
        {SUGGESTIONS.find((item) => item.id === selectedId)?.label}
      </DemoResult>
    </View>
  );
}
