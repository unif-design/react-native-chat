import { Text, View } from 'react-native';
import {
  Citation,
  Confirmation,
  Feedback,
  Process,
  ProcessingProgress,
  Sources,
  Suggestions,
} from '@unif/react-native-chat';
import type {
  ConfirmationStatus,
  FeedbackTone,
  ProcessStep,
  ProcessingProgressProps,
  SourceItem,
  SuggestionItem,
} from '@unif/react-native-chat';

const suggestion: SuggestionItem = {
  id: 'customer-search',
  label: '查询客户',
  icon: 'search',
};
const confirmationStatus: ConfirmationStatus = 'pending';
const feedbackTone: FeedbackTone = 'warning';
const source: SourceItem = { id: 'source-1', label: '1' };
const processStep: ProcessStep = {
  id: 'read',
  title: '读取附件',
  status: 'completed',
  statusText: '资料已读取',
};
const progress: ProcessingProgressProps = { progress: '正在读取资料 · 附件一' };

export const auxiliaryConsumption = (
  <View>
    <Suggestions items={[suggestion]} onSelect={(item) => item.id} />
    <Confirmation title="确认当前选择" status={confirmationStatus}>
      <Text>客户甲</Text>
    </Confirmation>
    <Process steps={[processStep]} defaultExpandedIds={[]} />
    <Process variant="timeline" steps={[processStep]} />
    <Process
      variant="compact"
      identity={<Text>助手</Text>}
      identityPlacement="inline"
      steps={[processStep]}
    />
    <ProcessingProgress {...progress} />
    <Process
      steps={[processStep]}
      expandedIds={[]}
      onExpandedChange={(ids) => ids.length}
    />
    <Feedback tone={feedbackTone} message="尚未取得最终结果" />
    <Sources items={[source]} onPress={(item) => item.id} />
    <Text>
      相关资料
      <Citation label="1" />
    </Text>
  </View>
);

export const invalidControlledProcess = (
  // @ts-expect-error 受控与局部默认展开不能同时使用。
  <Process
    steps={[processStep]}
    expandedIds={[]}
    defaultExpandedIds={[]}
    onExpandedChange={() => undefined}
  />
);
