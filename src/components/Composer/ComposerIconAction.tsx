import { ActivityIndicator, Pressable, View } from 'react-native';
import { useColors, useThemedStyles } from '@unif/react-native-design';
import {
  COMPOSER_ACTION_ICON_SIZE,
  COMPOSER_PRIMARY_ICON_SIZE,
  COMPOSER_CANCEL_ICON_SIZE,
} from './constants';
import { createStyles } from './styles';
import { useMousePress } from './useMousePress';
import type { ComposerIconActionProps } from './types';

export function ComposerIconAction({
  icon,
  label,
  onPress,
  disabled = false,
  busy = false,
  expanded,
  visual = 'icon',
}: ComposerIconActionProps) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const unavailable = disabled || busy;
  const { mousePressed, ...mouseHandlers } = useMousePress(unavailable);
  const primary = visual === 'primary';
  const color = primary
    ? disabled
      ? colors.foregroundSubtle
      : colors.onPrimary
    : visual === 'cancel'
      ? colors.foregroundMuted
      : colors.foreground;
  const Glyph = icon;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: unavailable, busy, expanded }}
      disabled={unavailable}
      onPress={unavailable ? undefined : onPress}
      {...mouseHandlers}
      style={styles.action}
    >
      {({ pressed }) => (
        <View
          pointerEvents="none"
          style={[
            styles.actionVisual,
            primary && styles.primary,
            visual === 'cancel' && styles.cancel,
            (pressed || mousePressed) &&
              (primary ? styles.primaryPressed : styles.actionPressed),
            disabled &&
              (primary ? styles.primaryDisabled : styles.actionDisabled),
          ]}
        >
          {busy ? (
            <ActivityIndicator size="small" color={color} />
          ) : (
            <Glyph
              size={
                primary
                  ? COMPOSER_PRIMARY_ICON_SIZE
                  : visual === 'cancel'
                    ? COMPOSER_CANCEL_ICON_SIZE
                    : COMPOSER_ACTION_ICON_SIZE
              }
              color={color}
              style={
                expanded ? { transform: [{ rotate: '45deg' }] } : undefined
              }
            />
          )}
        </View>
      )}
    </Pressable>
  );
}
