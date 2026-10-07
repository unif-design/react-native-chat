import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  Button,
  Icon,
  Pulse,
  Reveal,
  motion,
  pressedOpacity,
  useColors,
  useThemedStyles,
} from '@unif/react-native-design';
import { PROCESS_STATUS_ICONS, PROCESS_STATUS_LABELS } from './constants';
import { createStyles } from './styles';
import type { ProcessCompactStepProps } from './types';

export function ProcessCompactStep({
  step,
  identity,
  expanded,
  elapsed,
  onToggle,
}: ProcessCompactStepProps) {
  const styles = useThemedStyles(createStyles);
  const colors = useColors();
  const hasDetails = step.details != null;
  const running = step.status === 'running';
  const statusText = step.statusText ?? PROCESS_STATUS_LABELS[step.status];
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
      size={14}
      color={color}
    />
  );
  return (
    <View>
      <Pressable
        testID={`process-step-${step.id}-toggle`}
        accessible
        accessibilityRole={hasDetails ? 'button' : undefined}
        accessibilityLabel={`${step.title}，${statusText}${elapsed ? `，${elapsed}` : ''}`}
        accessibilityState={hasDetails ? { expanded } : undefined}
        disabled={!hasDetails}
        hitSlop={10}
        onPress={onToggle}
        style={({ pressed }) => [
          styles.compactHeader,
          pressed && { opacity: pressedOpacity },
        ]}
      >
        {identity ? (
          <>
            {identity}
            <View style={styles.spacer} />
          </>
        ) : null}
        {running ? (
          <Pulse from={0.4} duration={motion.pulse / 2}>
            {icon}
          </Pulse>
        ) : (
          icon
        )}
        {!identity ? (
          <Text
            style={styles.compactTitle}
            testID={`process-step-title-${step.id}`}
            numberOfLines={1}
          >
            {step.title}
          </Text>
        ) : null}
        <Text style={styles.compactStatus}>{statusText}</Text>
        {elapsed ? <Text style={styles.elapsed}>{elapsed}</Text> : null}
        {hasDetails ? (
          <Icon
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.foregroundSubtle}
          />
        ) : null}
      </Pressable>
      {step.description ? (
        <Text style={styles.compactDescription}>{step.description}</Text>
      ) : null}
      {hasDetails && expanded ? (
        <Reveal style={styles.compactDetailsContainer}>
          <ScrollView
            testID={`process-step-${step.id}-details`}
            style={styles.compactDetails}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
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
              style={styles.compactAction}
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
