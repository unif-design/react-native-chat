import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import {
  fixed,
  Textarea,
  useTheme,
  useThemedStyles,
} from '@unif/react-native-design';
import type { TextFieldHandle } from '@unif/react-native-design';
import {
  COMPOSER_INPUT_LINE_HEIGHT,
  COMPOSER_INPUT_MAX_LINES,
  COMPOSER_PLAIN_VERTICAL_INSET,
  PRIMARY_LABELS,
  VOICE_LABELS,
} from './constants';
import { ComposerIconAction } from './ComposerIconAction';
import { ComposerMenuItem } from './ComposerMenuItem';
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
    const { height: windowHeight } = useWindowDimensions();
    const inputRef = useRef<TextFieldHandle>(null);
    const lastHeight = useRef<number | undefined>(undefined);
    const [menuOpen, setMenuOpen] = useState(false);
    const [focused, setFocused] = useState(false);
    const voiceActive = voice !== undefined && voice.status !== 'idle';
    const expanded = focused || value.length > 0;
    const minHeight = Number.isFinite(minInputHeight)
      ? Math.max(fixed.hitTarget, minInputHeight!)
      : fixed.hitTarget;
    const defaultMaxHeight = Math.max(
      minHeight,
      COMPOSER_INPUT_LINE_HEIGHT * COMPOSER_INPUT_MAX_LINES * fontScale +
        COMPOSER_PLAIN_VERTICAL_INSET
    );
    const maxHeight = Number.isFinite(maxInputHeight)
      ? Math.max(minHeight, maxInputHeight!)
      : defaultMaxHeight;
    const showPrimary =
      primaryAction.kind !== 'send' ||
      primaryAction.allowEmpty ||
      value.trim().length > 0;
    const primaryDisabled =
      disabled || primaryAction.kind === 'busy' || primaryAction.disabled;
    const showToolbar =
      (expanded && actions.length > 0) || Boolean(voice) || showPrimary;
    const primaryLabel = primaryAction.label?.trim()
      ? primaryAction.label
      : PRIMARY_LABELS[primaryAction.kind];

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
      if (voiceActive) {
        inputRef.current?.blur();
        setFocused(false);
      }
      if (voiceActive || disabled) setMenuOpen(false);
    }, [voiceActive, disabled]);

    const moreAction =
      actions.length > 0 ? (
        <ComposerIconAction
          icon="plus"
          label="更多操作"
          expanded={menuOpen}
          disabled={disabled}
          onPress={() => setMenuOpen((open) => !open)}
        />
      ) : null;

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
        {header != null ? <View style={styles.accessory}>{header}</View> : null}
        {menuOpen && !disabled && !voiceActive && actions.length > 0 ? (
          <>
            <Pressable
              style={[styles.backdrop, { height: windowHeight }]}
              accessibilityRole="button"
              accessibilityLabel="收起更多操作"
              onPress={() => setMenuOpen(false)}
            />
            <View style={styles.menu} testID="composer-menu">
              <View style={styles.menuClip} testID="composer-menu-content">
                {actions.map((action) => (
                  <ComposerMenuItem
                    key={action.id}
                    action={action}
                    disabled={disabled}
                    onPress={() => {
                      if (disabled || action.disabled || action.loading) return;
                      setMenuOpen(false);
                      action.onPress();
                    }}
                  />
                ))}
              </View>
            </View>
          </>
        ) : null}
        <View
          testID="composer-regular"
          style={[
            styles.regular,
            expanded && styles.expanded,
            voiceActive && styles.hidden,
          ]}
          importantForAccessibility={
            voiceActive ? 'no-hide-descendants' : 'auto'
          }
        >
          {moreAction ? (
            <View
              key="more"
              style={[styles.more, expanded && styles.moreExpanded]}
            >
              {moreAction}
            </View>
          ) : null}
          <View
            key="input"
            style={[styles.input, expanded && styles.inputExpanded]}
          >
            <Textarea
              ref={inputRef}
              surface="plain"
              value={value}
              onChangeText={onChangeText}
              editable={editable}
              disabled={disabled || voiceActive}
              placeholder={placeholder}
              accessibilityLabel={inputAccessibilityLabel}
              minHeight={minHeight}
              maxHeight={maxHeight}
              submitBehavior="newline"
              onPressIn={() => setMenuOpen(false)}
              onFocus={() => {
                setMenuOpen(false);
                setFocused(true);
                onFocusChange?.(true);
              }}
              onBlur={() => {
                setFocused(false);
                onFocusChange?.(false);
              }}
            />
          </View>
          {showToolbar ? (
            <View
              key="toolbar"
              style={[
                styles.toolbar,
                expanded && styles.toolbarExpanded,
                expanded && moreAction != null && styles.toolbarWithMore,
              ]}
            >
              <View style={styles.trailingActions}>
                {voice ? (
                  <ComposerIconAction
                    icon="mic"
                    label="开始语音输入"
                    disabled={disabled || voice.disabled}
                    onPress={() => {
                      setMenuOpen(false);
                      voice.onStart();
                    }}
                  />
                ) : null}
                {showPrimary ? (
                  <ComposerIconAction
                    icon={primaryAction.kind === 'send' ? 'send' : 'stop'}
                    label={primaryLabel}
                    visual="primary"
                    disabled={primaryDisabled}
                    busy={primaryAction.kind === 'busy'}
                    onPress={() => {
                      if (primaryDisabled) return;
                      setMenuOpen(false);
                      if (primaryAction.kind === 'send')
                        primaryAction.onPress(value);
                      else if (primaryAction.kind === 'stop')
                        primaryAction.onPress();
                    }}
                  />
                ) : null}
              </View>
            </View>
          ) : null}
        </View>
        {voice && voice.status !== 'idle' ? (
          <View style={styles.voice}>
            <ComposerIconAction
              icon="close"
              visual="cancel"
              label="取消语音输入"
              disabled={disabled || voice.disabled}
              onPress={voice.onCancel}
            />
            <Text
              numberOfLines={1}
              ellipsizeMode="head"
              style={[
                styles.transcript,
                !voice.transcript && styles.transcriptPlaceholder,
              ]}
              accessibilityLiveRegion="polite"
            >
              {voice.status === 'starting'
                ? VOICE_LABELS.starting
                : voice.transcript || VOICE_LABELS[voice.status]}
            </Text>
            {voice.status === 'listening' ? (
              <ComposerIconAction
                icon="stop"
                visual="primary"
                label="停止语音输入"
                disabled={disabled || voice.disabled}
                onPress={voice.onStop}
              />
            ) : null}
          </View>
        ) : null}
        {footer != null ? <View style={styles.accessory}>{footer}</View> : null}
      </View>
    );
  }
);
