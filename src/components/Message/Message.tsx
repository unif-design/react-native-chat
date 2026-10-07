import { Pressable, Text, View } from 'react-native';
import {
  Button,
  IconButton,
  useThemedStyles,
  useColors,
} from '@unif/react-native-design';
import { MarkdownContent } from './MarkdownContent/MarkdownContent';
import { createStyles } from './styles';
import { isNestedAction } from './isNestedAction';
import { MessageWaiting } from './MessageWaiting';
import type { MessageProps } from './types';

export function Message(props: MessageProps) {
  const {
    placement = 'start',
    avatar,
    name,
    surface = 'bubble',
    fullWidth = false,
    status = 'idle',
    statusText,
    header,
    footer,
    actions = [],
    failureAction,
    onPress,
    onLongPress,
    style,
    testID,
  } = props;
  const styles = useThemedStyles(createStyles);
  const colors = useColors();
  const hasContent =
    Boolean(props.text?.length) ||
    (props.children !== undefined &&
      props.children !== null &&
      props.children !== false) ||
    (header !== undefined && header !== null && header !== false) ||
    (footer !== undefined && footer !== null && footer !== false);
  const waiting =
    (status === 'pending' || status === 'streaming') && !hasContent;
  const failedAction = status === 'failed' ? failureAction : undefined;
  const contentStyle = [
    styles.content,
    fullWidth && styles.fullWidth,
    surface === 'bubble' && [
      styles.bubble,
      placement === 'end' && styles.outgoing,
    ],
    surface === 'outlined' && styles.outlined,
    status === 'failed' && styles.failed,
    waiting &&
      surface === 'bubble' &&
      placement === 'start' &&
      styles.waitingBubble,
    failedAction && styles.failureContent,
    failedAction && fullWidth && styles.failureFullWidth,
  ];
  const content = (
    <>
      {header}
      {props.text !== undefined ? (
        props.format === 'markdown' ? (
          <MarkdownContent
            text={props.text}
            onLinkPress={props.onLinkPress}
            outgoing={surface === 'bubble' && placement === 'end'}
          />
        ) : (
          <Text
            selectable
            style={[
              styles.text,
              surface === 'bubble' &&
                placement === 'end' &&
                styles.outgoingText,
            ]}
            numberOfLines={props.numberOfLines}
          >
            {props.text}
          </Text>
        )
      ) : (
        props.children
      )}
      {waiting ? <MessageWaiting label={statusText} /> : null}
      {statusText && !waiting ? (
        <Text style={[styles.status, status === 'failed' && styles.errorText]}>
          {statusText}
        </Text>
      ) : null}
      {footer}
    </>
  );
  const bubble =
    onPress || onLongPress ? (
      <Pressable
        style={contentStyle}
        onPress={
          onPress
            ? (event) => {
                if (!isNestedAction(event)) onPress();
              }
            : undefined
        }
        onLongPress={
          onLongPress
            ? (event) => {
                if (!isNestedAction(event)) onLongPress();
              }
            : undefined
        }
        accessible={false}
      >
        {content}
      </Pressable>
    ) : (
      <View style={contentStyle}>{content}</View>
    );
  return (
    <View
      style={[styles.root, placement === 'end' && styles.end, style]}
      testID={testID}
    >
      {avatar}
      <View
        style={[
          styles.column,
          placement === 'end' && styles.columnEnd,
          fullWidth && styles.fullWidth,
        ]}
      >
        {name ? <Text style={styles.name}>{name}</Text> : null}
        {failedAction ? (
          <View style={[styles.failureRow, placement === 'end' && styles.end]}>
            {bubble}
            <IconButton
              icon="alert"
              size="sm"
              variant="ghost"
              color={colors.error}
              style={styles.failureAction}
              accessibilityLabel={failedAction.label}
              accessibilityHint={failedAction.accessibilityHint}
              disabled={failedAction.disabled}
              loading={failedAction.loading}
              onPress={failedAction.onPress}
            />
          </View>
        ) : (
          bubble
        )}
        {actions.length ? (
          <View style={styles.actions}>
            {actions.map((action) =>
              action.icon ? (
                <IconButton
                  key={action.id}
                  icon={action.icon}
                  size="sm"
                  variant="ghost"
                  color={colors.foregroundSubtle}
                  accessibilityLabel={action.label}
                  accessibilityHint={action.accessibilityHint}
                  disabled={action.disabled}
                  loading={action.loading}
                  onPress={action.onPress}
                />
              ) : (
                <Button
                  key={action.id}
                  label={action.label}
                  leftIcon={action.icon}
                  disabled={action.disabled}
                  loading={action.loading}
                  accessibilityHint={action.accessibilityHint}
                  variant="text"
                  onPress={action.onPress}
                />
              )
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}
