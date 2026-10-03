import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@unif/react-native-design';
import { ProcessingProgress } from '@unif/react-native-chat';
import { DemoResult } from '../DemoResult';
import { PROGRESS_EXAMPLES } from './constants';
import { styles } from './styles';

export function ProcessingProgressDemo() {
  const [progress, setProgress] = useState(PROGRESS_EXAMPLES.first);
  const [visible, setVisible] = useState(true);

  return (
    <View style={styles.root}>
      {visible ? <ProcessingProgress progress={progress} /> : null}
      <View style={styles.controls}>
        <Button
          label="更新说明"
          variant="secondary"
          onPress={() => setProgress(PROGRESS_EXAMPLES.next)}
        />
        <Button
          label="更换阶段"
          variant="secondary"
          onPress={() => setProgress(PROGRESS_EXAMPLES.stage)}
        />
        <Button
          label="长文案"
          variant="secondary"
          onPress={() => setProgress(PROGRESS_EXAMPLES.long)}
        />
        <Button
          label={visible ? '结束展示' : '重新开始'}
          onPress={() => setVisible((current) => !current)}
        />
      </View>
      <DemoResult>
        {visible
          ? '正在展示进度，可更新文案或结束展示。'
          : '调用方已结束展示。'}
      </DemoResult>
    </View>
  );
}
