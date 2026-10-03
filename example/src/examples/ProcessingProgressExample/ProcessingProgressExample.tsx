import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, useThemedStyles } from '@unif/react-native-design';
import { ProcessingProgress } from '@unif/react-native-chat';
import { PROGRESS_EXAMPLES } from './constants';
import { createStyles } from './styles';

export function ProcessingProgressExample() {
  const [progress, setProgress] = useState(PROGRESS_EXAMPLES.first);
  const [visible, setVisible] = useState(true);
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>ProcessingProgress</Text>
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
      <Text style={styles.note}>
        切换主题与大字号可检查中文长文案；系统减少动态效果设置会关闭文字动画。
      </Text>
    </View>
  );
}
