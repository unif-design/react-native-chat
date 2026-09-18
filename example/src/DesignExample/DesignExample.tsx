import { useState } from 'react';
import { Text, View } from 'react-native';
import { Textarea, useThemedStyles } from '@unif/react-native-design';
import { createStyles } from './styles';
export function DesignExample() {
  const [value, setValue] = useState('');
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.content}>
      <Text style={styles.title}>Unif Chat 开发示例</Text>
      <Text style={styles.description}>
        选择上方组件，验证独立交互、主题与字体。
      </Text>
      <Textarea
        value={value}
        onChangeText={setValue}
        minHeight={44}
        maxHeight={120}
        accessibilityLabel="Design 基础输入"
        placeholder="验证已发布的 Design 输入组件"
      />
    </View>
  );
}
