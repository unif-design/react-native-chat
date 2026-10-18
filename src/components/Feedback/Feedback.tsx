import { Text, View } from 'react-native';
import {
  Button,
  GlassLayer,
  r,
  useColors,
  useThemedStyles,
} from '@unif/react-native-design';
import { FEEDBACK_TONE_ICONS, FEEDBACK_TONE_LABELS } from './constants';
import { createStyles } from './styles';
import type { FeedbackProps, FeedbackTone } from './types';

function colorsForTone(
  tone: FeedbackTone,
  colors: ReturnType<typeof useColors>
) {
  switch (tone) {
    case 'success':
      return {
        backgroundColor: colors.successContainer,
        iconColor: colors.success,
      };
    case 'warning':
      return {
        backgroundColor: colors.primaryContainer,
        iconColor: colors.primary,
      };
    case 'error':
      return {
        backgroundColor: colors.errorContainer,
        iconColor: colors.error,
      };
    case 'info':
      return { backgroundColor: colors.infoContainer, iconColor: colors.info };
  }
}

export function Feedback({
  message,
  title,
  tone = 'info',
  action,
  style,
  testID,
}: FeedbackProps): React.JSX.Element {
  const styles = useThemedStyles(createStyles);
  const colors = useColors();
  const toneColors = colorsForTone(tone, colors);
  const toneLabel = FEEDBACK_TONE_LABELS[tone];
  const accessibilityLabel = `${toneLabel}：${title ? `${title}。` : ''}${message}`;

  const Glyph = FEEDBACK_TONE_ICONS[tone];
  return (
    <View style={[styles.root, style]} testID={testID}>
      <GlassLayer
        style={styles.material}
        tintColor={toneColors.backgroundColor}
        fallbackColor={toneColors.backgroundColor}
      />
      <Glyph size={r(18)} color={toneColors.iconColor} />
      <View style={styles.content}>
        <View accessible accessibilityLabel={accessibilityLabel}>
          {title ? (
            <Text style={styles.title} testID="feedback-title">
              {title}
            </Text>
          ) : null}
          <Text style={styles.message}>{message}</Text>
        </View>
        {action ? (
          <View style={styles.action}>
            <Button
              label={action.label}
              leftIcon={action.icon}
              onPress={action.onPress}
              disabled={action.disabled}
              loading={action.loading}
              accessibilityHint={action.accessibilityHint}
              size="sm"
              variant="secondary"
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}
