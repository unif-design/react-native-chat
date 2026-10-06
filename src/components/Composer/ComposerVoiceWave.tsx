import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import {
  usePrefersReducedMotion,
  useThemedStyles,
} from '@unif/react-native-design';
import {
  COMPOSER_VOICE_WAVE_PATTERN,
  COMPOSER_VOICE_WAVE_STAGGER_MS,
} from './constants';
import { createStyles } from './styles';

export function ComposerVoiceWave() {
  const styles = useThemedStyles(createStyles);
  const reducedMotion = usePrefersReducedMotion();
  const [values] = useState(() =>
    COMPOSER_VOICE_WAVE_PATTERN.map(
      (group) => new Animated.Value(group.from / Math.max(group.from, group.to))
    )
  );
  useEffect(() => {
    const animations = COMPOSER_VOICE_WAVE_PATTERN.map((group, index) => {
      const value = values[index]!;
      const maximum = Math.max(group.from, group.to);
      value.setValue((reducedMotion ? group.to : group.from) / maximum);
      return Animated.sequence([
        Animated.delay(index * COMPOSER_VOICE_WAVE_STAGGER_MS),
        Animated.loop(
          Animated.sequence(
            [group.to, group.from].map((height) =>
              Animated.timing(value, {
                toValue: height / maximum,
                duration: group.duration / 2,
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
    // 波形规格固定，输入文字更新不重启装饰动画。
  }, [reducedMotion, values]);
  return (
    <View
      style={styles.wave}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {COMPOSER_VOICE_WAVE_PATTERN.map((group, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveBar,
            {
              height: Math.max(group.from, group.to),
              transform: [{ scaleY: values[index]! }],
            },
          ]}
        />
      ))}
    </View>
  );
}
