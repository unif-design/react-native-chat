import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Icon, useColors, useThemedStyles } from '@unif/react-native-design';
import { COMPOSER_MENU_ICON_SIZE } from './constants';
import { useMousePress } from './useMousePress';
import { createStyles } from './styles';
import type { ComposerMenuItemProps } from './types';

export function ComposerMenuItem({
  action,
  disabled,
  onPress,
}: ComposerMenuItemProps) {
  const styles = useThemedStyles(createStyles);
  const colors = useColors();
  const busy = action.loading === true;
  const named = action.label.trim().length > 0;
  const unavailable = disabled || action.disabled === true || busy || !named;
  const { mousePressed, ...mouseHandlers } = useMousePress(unavailable);
  return (
    <Pressable
      accessible={named}
      accessibilityRole={named ? 'button' : undefined}
      accessibilityLabel={named ? action.label : undefined}
      accessibilityHint={action.accessibilityHint}
      accessibilityState={{ disabled: unavailable, busy }}
      disabled={unavailable}
      onPress={unavailable ? undefined : onPress}
      {...mouseHandlers}
      style={({ pressed }) => [
        styles.menuRow,
        (pressed || mousePressed) && styles.menuRowPressed,
        unavailable && styles.actionDisabled,
      ]}
    >
      {action.icon || busy ? (
        <View
          testID={`composer-menu-icon-${action.id}`}
          style={styles.menuIcon}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {busy ? (
            <ActivityIndicator size="small" color={colors.foregroundMuted} />
          ) : action.icon ? (
            <Icon
              name={action.icon}
              size={COMPOSER_MENU_ICON_SIZE}
              color={colors.foreground}
            />
          ) : null}
        </View>
      ) : null}
      <Text style={styles.menuLabel}>{action.label}</Text>
    </Pressable>
  );
}
