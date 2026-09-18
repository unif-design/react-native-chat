import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Text, View } from 'react-native';
import {
  Button,
  fixed,
  IconButton,
  Textarea,
  useTheme,
  useThemedStyles,
} from '@unif/react-native-design';
import type { TextFieldHandle } from '@unif/react-native-design';
import {
  DEFAULT_MAX_INPUT_HEIGHT,
  PRIMARY_LABELS,
  VOICE_LABELS,
} from './constants';
import { createStyles } from './styles';
import type { ComposerHandle, ComposerProps } from './types';

export const Composer = forwardRef<ComposerHandle, ComposerProps>(
  function ComposerInput(
    {
      value,
      onChangeText,
      primaryAction,
      editable = true,
      disabled = false,
      placeholder = '输入消息…',
      inputAccessibilityLabel = '消息输入框',
      actions = [],
      voice,
      header,
      footer,
      surface = 'card',
      minInputHeight,
      maxInputHeight,
      onFocusChange,
      onHeightChange,
      style,
      testID,
    },
    ref
  ) {
    const styles = useThemedStyles(createStyles);
    const { fontScale } = useTheme();
    const inputRef = useRef<TextFieldHandle>(null);
    const lastHeight = useRef<number | undefined>(undefined);
    const [menuOpen, setMenuOpen] = useState(false);
    const voiceActive = voice !== undefined && voice.status !== 'idle';
    const minHeight = Number.isFinite(minInputHeight)
      ? Math.max(fixed.hitTarget, minInputHeight!)
      : fixed.hitTarget;
    const defaultMaxHeight = Math.max(
      minHeight,
      DEFAULT_MAX_INPUT_HEIGHT * fontScale
    );
    const maxHeight = Number.isFinite(maxInputHeight)
      ? Math.max(minHeight, maxInputHeight!)
      : defaultMaxHeight;

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          if (!disabled && !voiceActive) inputRef.current?.focus();
        },
        blur: () => inputRef.current?.blur(),
      }),
      [disabled, voiceActive]
    );

    useEffect(() => {
      if (voiceActive) inputRef.current?.blur();
      if (voiceActive || disabled) setMenuOpen(false);
    }, [voiceActive, disabled]);

    const primaryDisabled =
      disabled ||
      primaryAction.kind === 'busy' ||
      primaryAction.disabled ||
      (primaryAction.kind === 'send' &&
        !primaryAction.allowEmpty &&
        value.trim().length === 0);

    return (
      <View
        testID={testID}
        style={[styles.root, surface === 'card' && styles.card, style]}
        onLayout={({ nativeEvent: { layout } }) => {
          if (layout.height !== lastHeight.current) {
            lastHeight.current = layout.height;
            onHeightChange?.(layout.height);
          }
        }}
      >
        {header}
        <View
          style={[styles.regular, voiceActive && styles.hidden]}
          importantForAccessibility={
            voiceActive ? 'no-hide-descendants' : 'auto'
          }
        >
          <Textarea
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            editable={editable}
            disabled={disabled || voiceActive}
            placeholder={placeholder}
            accessibilityLabel={inputAccessibilityLabel}
            minHeight={minHeight}
            maxHeight={maxHeight}
            submitBehavior="newline"
            onFocus={() => {
              setMenuOpen(false);
              onFocusChange?.(true);
            }}
            onBlur={() => onFocusChange?.(false)}
          />
          <View style={styles.toolbar}>
            {actions.length > 0 ? (
              <IconButton
                icon="more-h"
                size="lg"
                accessibilityLabel="更多操作"
                accessibilityState={{ expanded: menuOpen }}
                disabled={disabled}
                onPress={() => setMenuOpen((open) => !open)}
              />
            ) : null}
            {voice ? (
              <IconButton
                icon="mic"
                size="lg"
                accessibilityLabel="开始语音输入"
                disabled={disabled || voice.disabled}
                onPress={voice.onStart}
              />
            ) : null}
            <Button
              label={primaryAction.label ?? PRIMARY_LABELS[primaryAction.kind]}
              size="lg"
              style={styles.primary}
              disabled={primaryDisabled}
              loading={primaryAction.kind === 'busy'}
              onPress={() => {
                if (primaryDisabled) return;
                if (primaryAction.kind === 'send') primaryAction.onPress(value);
                else if (primaryAction.kind === 'stop') primaryAction.onPress();
              }}
            />
          </View>
          {menuOpen && actions.length > 0 ? (
            <View style={styles.menu}>
              {actions.map((action) => (
                <Button
                  key={action.id}
                  label={action.label}
                  leftIcon={action.icon}
                  disabled={disabled || action.disabled}
                  loading={action.loading}
                  variant="secondary"
                  accessibilityHint={action.accessibilityHint}
                  onPress={() => {
                    if (disabled || action.disabled || action.loading) return;
                    setMenuOpen(false);
                    action.onPress();
                  }}
                />
              ))}
            </View>
          ) : null}
        </View>
        {voice && voice.status !== 'idle' ? (
          <View style={styles.voice}>
            <Text style={styles.transcript} accessibilityLiveRegion="polite">
              {voice.status === 'starting'
                ? VOICE_LABELS.starting
                : voice.transcript || VOICE_LABELS[voice.status]}
            </Text>
            <View style={styles.toolbar}>
              {voice.status === 'listening' ? (
                <Button
                  label="停止语音输入"
                  disabled={disabled || voice.disabled}
                  onPress={voice.onStop}
                />
              ) : null}
              <Button
                label="取消语音输入"
                variant="secondary"
                disabled={disabled || voice.disabled}
                onPress={voice.onCancel}
              />
            </View>
          </View>
        ) : null}
        {footer}
      </View>
    );
  }
);
