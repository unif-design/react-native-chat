import { Text, View } from 'react-native';
import {
  Button,
  Icon,
  StatusDot,
  icon,
  useColors,
  useThemedStyles,
} from '@unif/react-native-design';
import { PROCESS_STATUS_LABELS } from './constants';
import { createStyles } from './styles';
import type { ProcessCompactStepProps } from './types';

export function ProcessTimelineStep({
  step,
  last,
  expanded,
  elapsed,
  onToggle,
}: ProcessCompactStepProps & { last: boolean }) {
  const styles = useThemedStyles(createStyles);
  const colors = useColors();
  const status =
    step.status === 'running'
      ? 'active'
      : step.status === 'completed'
        ? 'done'
        : step.status === 'failed'
          ? 'error'
          : 'pending';
  return (
    <View
      style={styles.timelineStep}
      accessibilityLabel={`${step.title}，${step.statusText ?? PROCESS_STATUS_LABELS[step.status]}`}
    >
      <View style={styles.timelineGutter}>
        {step.status === 'cancelled' ? (
          <Icon name="close" size={icon.xs} color={colors.foregroundSubtle} />
        ) : (
          <StatusDot
            status={status}
            tone="soft"
            size={icon.xs}
            accessibilityLabel=""
          />
        )}
        {!last ? <View style={styles.timelineLine} /> : null}
      </View>
      <View style={[styles.timelineBody, !last && styles.timelineBodyNotLast]}>
        <View style={styles.stepHeader}>
          <Text
            testID={`process-step-title-${step.id}`}
            style={[
              styles.timelineTitle,
              step.status === 'running' && styles.timelineActive,
              step.status === 'pending' && styles.timelinePending,
            ]}
            numberOfLines={1}
          >
            {step.title}
          </Text>
          {step.description ? (
            <Text
              style={[
                styles.timelineDescription,
                step.status === 'failed' && styles.timelineError,
              ]}
              numberOfLines={1}
            >
              {step.description}
            </Text>
          ) : null}
        </View>
        {elapsed ? <Text style={styles.elapsed}>{elapsed}</Text> : null}
        {step.details != null ? (
          <>
            <Button
              label={expanded ? '收起详情' : '展开详情'}
              onPress={onToggle}
              size="sm"
              variant="text"
              testID={`process-step-${step.id}-toggle`}
            />
            {expanded ? (
              <View style={styles.details}>{step.details}</View>
            ) : null}
          </>
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
    </View>
  );
}
