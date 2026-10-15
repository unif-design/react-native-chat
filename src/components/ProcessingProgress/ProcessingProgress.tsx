import { Text, View } from 'react-native';
import {
  ShimmerText,
  useTheme,
  useThemedStyles,
} from '@unif/react-native-design';
import { PROCESSING_PROGRESS_SEPARATOR } from './constants';
import { createStyles } from './styles';
import type { ProcessingProgressProps } from './types';

export function ProcessingProgress({ progress }: ProcessingProgressProps) {
  const styles = useThemedStyles(createStyles);
  const { colors, scheme } = useTheme();
  const separatorIndex = progress.indexOf(PROCESSING_PROGRESS_SEPARATOR);
  const prefix =
    separatorIndex === -1 ? progress : progress.slice(0, separatorIndex);
  const suffix = separatorIndex === -1 ? '' : progress.slice(separatorIndex);

  return (
    <View
      style={styles.root}
      accessible
      accessibilityRole="text"
      accessibilityLabel={progress}
      accessibilityState={{ busy: true }}
      aria-busy
      accessibilityLiveRegion="polite"
    >
      <Text
        testID="processing-progress-line"
        style={styles.text}
        numberOfLines={1}
        ellipsizeMode="tail"
        accessible={false}
        aria-hidden
      >
        <ShimmerText
          style={{
            color:
              scheme === 'dark' ? colors.foregroundMuted : colors.foreground,
          }}
        >
          {prefix}
        </ShimmerText>
        {suffix ? (
          <Text testID="processing-progress-suffix">{suffix}</Text>
        ) : null}
      </Text>
    </View>
  );
}
