import { useState } from 'react';
import { View } from 'react-native';
import { Feedback } from '@unif/react-native-chat';
import {
  ACKNOWLEDGED_MESSAGE,
  ACKNOWLEDGED_TITLE,
  DRAFT_MESSAGE,
  DRAFT_TITLE,
} from './constants';
import { DemoResult } from '../DemoResult';
import { styles } from './styles';

export function FeedbackDemo() {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <View style={styles.root}>
      <Feedback
        tone={acknowledged ? 'info' : 'warning'}
        title={acknowledged ? ACKNOWLEDGED_TITLE : DRAFT_TITLE}
        message={acknowledged ? ACKNOWLEDGED_MESSAGE : DRAFT_MESSAGE}
        action={{
          id: 'acknowledge',
          label: acknowledged ? '再次查看提示' : '我知道了',
          onPress: () => setAcknowledged((current) => !current),
        }}
      />
      <DemoResult>
        {acknowledged ? '已收到“我知道了”操作' : '等待处理这条提示'}
      </DemoResult>
    </View>
  );
}
