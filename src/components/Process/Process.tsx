import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import {
  Button,
  Icon,
  useColors,
  useThemedStyles,
} from '@unif/react-native-design';
import { PROCESS_STATUS_ICONS, PROCESS_STATUS_LABELS } from './constants';
import { createStyles } from './styles';
import type { ProcessProps, ProcessStep } from './types';

function idsWithDetails(
  ids: readonly string[],
  steps: readonly ProcessStep[]
): readonly string[] {
  const availableIds = new Set(
    steps.filter((step) => step.details != null).map((step) => step.id)
  );
  return ids.filter((id) => availableIds.has(id));
}

function formatElapsedMs(elapsedMs: number | undefined): string | undefined {
  if (elapsedMs === undefined || !Number.isFinite(elapsedMs) || elapsedMs < 0) {
    return undefined;
  }
  if (elapsedMs < 1000) return `${Math.round(elapsedMs)} 毫秒`;

  const roundedSeconds = Math.round(elapsedMs / 100) / 10;
  if (roundedSeconds < 60) {
    const formatted = Number.isInteger(roundedSeconds)
      ? String(roundedSeconds)
      : roundedSeconds.toFixed(1);
    return `${formatted} 秒`;
  }

  const totalSeconds = Math.round(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return remainingSeconds === 0
    ? `${minutes} 分钟`
    : `${minutes} 分 ${remainingSeconds} 秒`;
}

export function Process(props: ProcessProps): React.JSX.Element {
  const { steps, title, identity, style, testID } = props;
  const styles = useThemedStyles(createStyles);
  const colors = useColors();
  const isControlled = props.expandedIds !== undefined;
  const [localExpandedIds, setLocalExpandedIds] = useState<readonly string[]>(
    () => idsWithDetails(props.defaultExpandedIds ?? [], steps)
  );

  useEffect(() => {
    if (!isControlled) {
      setLocalExpandedIds((current) => idsWithDetails(current, steps));
    }
  }, [isControlled, steps]);

  const expandedIds = idsWithDetails(
    isControlled ? props.expandedIds : localExpandedIds,
    steps
  );

  const toggleDetails = (stepId: string) => {
    const nextIds = expandedIds.includes(stepId)
      ? expandedIds.filter((id) => id !== stepId)
      : [...expandedIds, stepId];
    if (!isControlled) setLocalExpandedIds(nextIds);
    props.onExpandedChange?.(nextIds);
  };

  return (
    <View style={[styles.root, style]} testID={testID}>
      {title || identity ? (
        <View style={styles.heading}>
          {identity}
          {title ? <Text style={styles.headingTitle}>{title}</Text> : null}
        </View>
      ) : null}
      <View style={styles.steps}>
        {steps.map((step, index) => {
          const statusLabel = PROCESS_STATUS_LABELS[step.status];
          const elapsed = formatElapsedMs(step.elapsedMs);
          const isExpanded = expandedIds.includes(step.id);
          return (
            <View
              key={step.id}
              style={[
                styles.step,
                index === steps.length - 1 && styles.stepLast,
              ]}
            >
              <View style={styles.stepHeader}>
                <Text
                  style={styles.stepTitle}
                  testID={`process-step-title-${step.id}`}
                >
                  {step.title}
                </Text>
                <View
                  style={styles.status}
                  accessible
                  accessibilityLabel={`${step.title}，${statusLabel}`}
                >
                  <Icon
                    name={PROCESS_STATUS_ICONS[step.status]}
                    color={
                      step.status === 'failed'
                        ? colors.error
                        : step.status === 'completed'
                          ? colors.success
                          : colors.foregroundMuted
                    }
                  />
                  <Text style={styles.statusText}>{statusLabel}</Text>
                </View>
              </View>
              {step.description ? (
                <Text style={styles.description}>{step.description}</Text>
              ) : null}
              {elapsed ? <Text style={styles.elapsed}>{elapsed}</Text> : null}
              {step.details != null ? (
                <>
                  <Button
                    label={isExpanded ? '收起详情' : '展开详情'}
                    onPress={() => toggleDetails(step.id)}
                    size="sm"
                    variant="text"
                    testID={`process-step-${step.id}-toggle`}
                  />
                  {isExpanded ? (
                    <View style={styles.details}>{step.details}</View>
                  ) : null}
                </>
              ) : null}
              {step.actions && step.actions.length > 0 ? (
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
                      variant="outline"
                    />
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
