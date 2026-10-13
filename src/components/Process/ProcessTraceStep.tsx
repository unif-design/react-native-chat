import {
  ChevronDownOutlined,
  ChevronUpOutlined,
} from '@unif/react-native-icons';
import { Pressable, Text, View } from 'react-native';
import {
  Button,
  Card,
  Tag,
  useColors,
  useThemedStyles,
} from '@unif/react-native-design';
import { PROCESS_STATUS_ICONS, PROCESS_STATUS_LABELS } from './constants';
import { createStyles } from './styles';
import { hasProcessDetails } from './hasProcessDetails';
import type { ProcessCompactStepProps } from './types';

export function ProcessTraceStep({
  step,
  expanded,
  elapsed,
  onToggle,
}: ProcessCompactStepProps) {
  const styles = useThemedStyles(createStyles);
  const colors = useColors();
  const hasDetails = hasProcessDetails(step.details);
  const label = step.statusText ?? PROCESS_STATUS_LABELS[step.status];
  const variant =
    step.status === 'failed'
      ? 'error'
      : step.status === 'completed'
        ? 'success'
        : step.status === 'running'
          ? 'brand'
          : 'neutral';
  const color =
    step.status === 'failed'
      ? colors.error
      : step.status === 'completed'
        ? colors.success
        : step.status === 'running'
          ? colors.primary
          : colors.foregroundMuted;
  const Glyph = step.icon ?? PROCESS_STATUS_ICONS[step.status];
  const Chevron = expanded ? ChevronUpOutlined : ChevronDownOutlined;
  const head = (
    <View style={styles.traceHeader}>
      <View style={styles.traceContent}>
        <View style={styles.traceIdentity}>
          {step.icon !== null ? (
            <View style={styles.traceGlyph}>
              <Glyph size={14} color={color} />
            </View>
          ) : null}
          <Text
            style={styles.traceTitle}
            testID={`process-step-title-${step.id}`}
          >
            {step.title}
          </Text>
        </View>
        <View style={styles.traceBadges}>
          {step.sourceLabel ? (
            <Tag label={step.sourceLabel} variant="neutral" />
          ) : null}
          {label || elapsed ? (
            <Tag
              label={[label, elapsed].filter(Boolean).join(' · ')}
              variant={variant}
            />
          ) : null}
        </View>
      </View>
      {hasDetails ? (
        <View style={styles.traceGlyph}>
          <Chevron size={16} color={colors.foregroundSubtle} />
        </View>
      ) : null}
    </View>
  );
  const accessibilityLabel = [
    step.sourceLabel,
    step.title,
    label || PROCESS_STATUS_LABELS[step.status],
    elapsed,
  ]
    .filter(Boolean)
    .join('，');
  return (
    <Card variant="plain" bare>
      {hasDetails ? (
        <Pressable
          testID={`process-step-${step.id}-toggle`}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ expanded }}
          onPress={onToggle}
        >
          {head}
        </Pressable>
      ) : (
        <View
          accessible
          accessibilityRole="text"
          accessibilityLabel={accessibilityLabel}
        >
          {head}
        </View>
      )}
      {step.description ? (
        <Text style={styles.description}>{step.description}</Text>
      ) : null}
      {hasDetails && expanded ? (
        <View
          style={styles.traceDetails}
          testID={`process-step-${step.id}-details`}
        >
          {step.details}
        </View>
      ) : null}
      {step.actions?.length ? (
        <View style={styles.actions}>
          {step.actions.map((action) => (
            <Button
              key={action.id}
              label={action.label}
              leftIcon={action.icon}
              onPress={action.onPress}
              disabled={action.disabled}
              loading={action.loading}
              accessibilityHint={action.accessibilityHint}
              size="sm"
              variant="text"
            />
          ))}
        </View>
      ) : null}
    </Card>
  );
}
