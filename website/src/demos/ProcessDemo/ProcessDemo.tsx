import { useState } from 'react';
import { Text, View } from 'react-native';
import { Avatar, useThemedStyles } from '@unif/react-native-design';
import { Process } from '@unif/react-native-chat';
import type { ProcessStep } from '@unif/react-native-chat';
import { PROCESS_STEPS } from './constants';
import { DemoResult } from '../DemoResult';
import { createStyles } from './styles';

export function ProcessDemo() {
  const [expandedIds, setExpandedIds] = useState<readonly string[]>([
    'organize',
  ]);
  const [result, setResult] = useState('“组织回答”详情已展开');
  const styles = useThemedStyles(createStyles);

  const steps: readonly ProcessStep[] = PROCESS_STEPS.map((step) =>
    step.id === 'organize'
      ? {
          ...step,
          details: (
            <Text style={styles.details}>
              当前展示包含摘要、行动项和一条待确认问题。
            </Text>
          ),
        }
      : step.id === 'review'
        ? {
            ...step,
            actions: [
              {
                id: 'inspect',
                label: '查看草稿',
                onPress: () => setResult('已收到查看本地草稿事件'),
              },
            ],
          }
        : step
  );

  return (
    <View style={styles.root}>
      <Process
        title="回答整理过程"
        identity={<Avatar label="AI" size="sm" variant="brand" />}
        steps={steps}
        expandedIds={expandedIds}
        onExpandedChange={(ids) => {
          setExpandedIds(ids);
          setResult(ids.length > 0 ? '已展开步骤详情' : '已收起步骤详情');
        }}
      />
      <DemoResult>{result}</DemoResult>
    </View>
  );
}
