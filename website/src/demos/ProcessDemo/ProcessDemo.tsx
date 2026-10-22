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
  const [reviewStopped, setReviewStopped] = useState(false);

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
        variant="timeline"
        steps={[
          { id: 'receive', title: '接收资料', status: 'completed' },
          {
            id: 'review',
            title: '核对资料',
            status: reviewStopped ? 'cancelled' : 'running',
            description: '还有 3 份',
            actionsPlacement: 'trailing',
            actions: [
              {
                id: 'toggle-review',
                label: reviewStopped ? '重新核对' : '停止核对',
                onPress: () => {
                  setReviewStopped(!reviewStopped);
                  setResult(
                    reviewStopped ? '已请求重新核对' : '已请求停止核对'
                  );
                },
              },
            ],
          },
        ]}
      />
      <Process
        variant="compact"
        compactDensity="dense"
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
      <Process
        variant="trace"
        steps={[
          {
            id: 'query-result',
            title: '查询资料',
            sourceLabel: '工具',
            status: 'completed',
            statusText: '完成',
            details: <Text style={styles.details}>已读取本次查询的资料。</Text>,
          },
        ]}
      />
    </View>
  );
}
