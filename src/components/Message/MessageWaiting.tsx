import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, Text, View } from 'react-native';
import {
  usePrefersReducedMotion,
  useThemedStyles,
} from '@unif/react-native-design';
import {
  MESSAGE_WAITING_DOT_DELAYS,
  MESSAGE_WAITING_DOT_DURATION,
  MESSAGE_WAITING_DOT_MIN_OPACITY,
} from './constants';
import { createStyles } from './styles';
import type { MessageWaitingProps } from './types';

export function MessageWaiting({ label }: MessageWaitingProps) {
  const styles = useThemedStyles(createStyles);
  const reducedMotion = usePrefersReducedMotion();
  const [values] = useState(() =>
    MESSAGE_WAITING_DOT_DELAYS.map(() => new Animated.Value(1))
  );
  useEffect(() => {
    const animations = MESSAGE_WAITING_DOT_DELAYS.map((delay, index) => {
      const value = values[index]!;
      value.setValue(reducedMotion ? 1 : MESSAGE_WAITING_DOT_MIN_OPACITY);
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence(
            [1, MESSAGE_WAITING_DOT_MIN_OPACITY].map((toValue) =>
              Animated.timing(value, {
                toValue,
                duration: MESSAGE_WAITING_DOT_DURATION,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: Platform.OS !== 'web',
              })
            )
          )
        ),
      ]);
    });
    if (!reducedMotion) animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [reducedMotion, values]);
  return (
    <View
      style={styles.waitingRow}
      accessible
      accessibilityLabel={label || '正在等待回复'}
      accessibilityState={{ busy: true }}
    >
      <View
        style={styles.waitingDots}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {values.map((opacity, index) => (
          <Animated.View
            key={index}
            testID={`message-waiting-dot-${index}`}
            style={[styles.waitingDot, { opacity }]}
          />
        ))}
      </View>
      {label ? <Text style={styles.waitingLabel}>{label}</Text> : null}
    </View>
  );
}
