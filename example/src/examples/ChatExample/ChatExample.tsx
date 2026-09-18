import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, useThemedStyles } from '@unif/react-native-design';
import { Chat } from '@unif/react-native-chat';
import { createStyles } from './styles';

export function ChatExample() {
  const styles = useThemedStyles(createStyles);
  const [showSlots, setShowSlots] = useState(true);
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.root}>
      <Button
        label="切换顶部和底部"
        onPress={() => setShowSlots((current) => !current)}
      />
      <Chat
        testID="chat-layout-example"
        bottomInset={16}
        header={
          showSlots ? <Text style={styles.text}>顶部内容</Text> : undefined
        }
        footer={
          showSlots ? (
            <Text style={styles.text}>底部说明；底部留白 16</Text>
          ) : undefined
        }
        composer={
          <View style={styles.input}>
            <Button
              label="切换输入区域高度"
              onPress={() => setExpanded((current) => !current)}
            />
            {expanded ? (
              <Text style={styles.text}>
                {'输入区域的额外内容\n'.repeat(5)}
              </Text>
            ) : null}
          </View>
        }
      >
        <View style={styles.messages}>
          <Text style={styles.text}>消息区域使用剩余高度</Text>
        </View>
      </Chat>
    </View>
  );
}
