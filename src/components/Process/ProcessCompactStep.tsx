import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  Button,
  Icon,
  Pulse,
  Reveal,
  pressedOpacity,
  r,
  useColors,
  useThemedStyles,
} from '@unif/react-native-design';
import { PROCESS_STATUS_ICONS, PROCESS_STATUS_LABELS } from './constants';
import { createStyles } from './styles';
import type { ProcessCompactStepProps } from './types';

export function ProcessCompactStep({
  step,
  expanded,
  elapsed,
  onToggle,
}: ProcessCompactStepProps) {
  const styles = useThemedStyles(createStyles);
  const colors = useColors();
  const hasDetails = step.details != null;
  const running = step.status === 'running';
  const color = running
    ? colors.primary
    : step.status === 'completed'
      ? colors.success
      : step.status === 'failed'
        ? colors.error
        : colors.foregroundMuted;
  const icon = (
    <Icon
      name={
        running || step.status === 'completed'
          ? 'spark'
          : PROCESS_STATUS_ICONS[step.status]
      }
      size={r(14)}
      color={color}
    />
  );
  return (
    <View>
      <Pressable
        testID={`process-step-${step.id}-toggle`}
        accessible
        accessibilityRole={hasDetails ? 'button' : undefined}
        accessibilityLabel={`${step.title}，${PROCESS_STATUS_LABELS[step.status]}${elapsed ? `，${elapsed}` : ''}`}
        accessibilityState={hasDetails ? { expanded } : undefined}
        disabled={!hasDetails}
        onPress={onToggle}
        style={({ pressed }) => [
          styles.compactHeader,
          pressed && { opacity: pressedOpacity },
        ]}
      >
        {running ? <Pulse>{icon}</Pulse> : icon}
        <Text
          style={styles.compactTitle}
          testID={`process-step-title-${step.id}`}
          numberOfLines={1}
        >
          {step.title}
        </Text>
        {elapsed ? <Text style={styles.elapsed}>{elapsed}</Text> : null}
        {hasDetails ? (
          <Icon
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={r(14)}
            color={colors.foregroundSubtle}
          />
        ) : null}
      </Pressable>
      {step.description ? (
        <Text style={styles.compactDescription}>{step.description}</Text>
      ) : null}
      {hasDetails && expanded ? (
        <Reveal>
          <ScrollView
            testID={`process-step-${step.id}-details`}
            style={styles.compactDetails}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {step.details}
          </ScrollView>
        </Reveal>
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
    </View>
  );
}
