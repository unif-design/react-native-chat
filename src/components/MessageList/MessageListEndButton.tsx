import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import {
  IconButton,
  Reveal,
  Spinner,
  usePrefersReducedMotion,
  useThemedStyles,
} from '@unif/react-native-design';
import { createStyles } from './styles';
import type { MessageListEndButtonProps } from './types';

export function MessageListEndButton({
  busy,
  onPress,
}: MessageListEndButtonProps) {
  const styles = useThemedStyles(createStyles);
  const reducedMotion = usePrefersReducedMotion();
  const scale = useRef(new Animated.Value(reducedMotion ? 1 : 0.8)).current;
  useEffect(() => {
    if (reducedMotion) {
      scale.setValue(1);
      return;
    }
    const animation = Animated.spring(scale, {
      toValue: 1,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [reducedMotion, scale]);
  return (
    <View style={styles.returnToEnd} pointerEvents="box-none">
      <Reveal>
        <Animated.View
          style={[styles.returnVisual, { transform: [{ scale }] }]}
        >
          {busy ? (
            <View style={styles.returnProgress} pointerEvents="none">
              <Spinner size={44} thickness={2} />
            </View>
          ) : null}
          <IconButton
            icon="arrow-down"
            accessibilityLabel={
              busy ? '回到最新消息，正在处理' : '回到最新消息'
            }
            variant="ghost"
            size="md"
            surfaceSize={36}
            iconSize={18}
            style={styles.returnButton}
            onPress={onPress}
          />
        </Animated.View>
      </Reveal>
    </View>
  );
}
