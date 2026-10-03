import { memo, useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Text } from 'react-native';
import { useTheme } from '@unif/react-native-design';
import {
  PROCESSING_PROGRESS_SHINE_DURATION_MS,
  PROCESSING_PROGRESS_SHINE_PEAK,
  PROCESSING_PROGRESS_SHINE_RADIUS,
} from './constants';
import type { ProcessingProgressPrefixProps } from './types';

export const ProcessingProgressPrefix = memo(function Prefix({
  text,
  reducedMotion,
}: ProcessingProgressPrefixProps) {
  const { colors, scheme } = useTheme();
  const animation = useRef(
    new Animated.Value(-PROCESSING_PROGRESS_SHINE_RADIUS)
  ).current;
  const characters = Array.from(text);

  useEffect(() => {
    if (reducedMotion || !characters.length) return undefined;
    const loop = Animated.loop(
      Animated.timing(animation, {
        toValue: characters.length + PROCESSING_PROGRESS_SHINE_RADIUS,
        duration: PROCESSING_PROGRESS_SHINE_DURATION_MS,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
        isInteraction: false,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [animation, characters.length, reducedMotion]);

  const baseColor =
    scheme === 'dark' ? colors.foregroundMuted : colors.foreground;

  if (reducedMotion) return <Text style={{ color: baseColor }}>{text}</Text>;

  return (
    <Text>
      {characters.map((character, index) => (
        <Animated.Text
          key={`${index}:${character}`}
          style={{
            color: animation
              .interpolate({
                inputRange: [
                  index - PROCESSING_PROGRESS_SHINE_RADIUS,
                  index,
                  index + PROCESSING_PROGRESS_SHINE_RADIUS,
                ],
                outputRange: [0, PROCESSING_PROGRESS_SHINE_PEAK, 0],
                extrapolate: 'clamp',
              })
              .interpolate({
                inputRange: [0, 1],
                outputRange: [baseColor, colors.onPrimary],
              }),
          }}
        >
          {character}
        </Animated.Text>
      ))}
    </Text>
  );
});
