import { Pressable, Text, View } from 'react-native';
import { Button, Spinner, useThemedStyles } from '@unif/react-native-design';
import { MarkdownContent } from './MarkdownContent/MarkdownContent';
import { createStyles } from './styles';
import { isNestedAction } from './isNestedAction';
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
    onPress,
    onLongPress,
    style,
    testID,
  } = props;
  const styles = useThemedStyles(createStyles);
  const hasContent =
    Boolean(props.text?.length) ||
    (props.children !== undefined &&
      props.children !== null &&
      props.children !== false) ||
    (header !== undefined && header !== null && header !== false) ||
    (footer !== undefined && footer !== null && footer !== false);
  const waiting =
    (status === 'pending' || status === 'streaming') && !hasContent;
  const contentStyle = [
    styles.content,
    fullWidth && styles.fullWidth,
    surface === 'bubble' && [
      styles.bubble,
      placement === 'end' && styles.outgoing,
    ],
    surface === 'outlined' && styles.outlined,
    status === 'failed' && styles.failed,
  ];
  const content = (
    <>
      {header}
      {props.text !== undefined ? (
        props.format === 'markdown' ? (
          <MarkdownContent text={props.text} onLinkPress={props.onLinkPress} />
        ) : (
          <Text
            selectable
            style={styles.text}
            numberOfLines={props.numberOfLines}
          >
            {props.text}
          </Text>
        )
      ) : (
        props.children
      )}
      {waiting ? (
        <View
          accessible
          accessibilityLabel="正在等待回复"
          accessibilityState={{ busy: true }}
        >
          <Spinner />
        </View>
      ) : null}
      {statusText ? (
        <Text style={[styles.status, status === 'failed' && styles.errorText]}>
          {statusText}
        </Text>
      ) : null}
      {footer}
    </>
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
        {onPress || onLongPress ? (
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
        )}
        {actions.length ? (
          <View style={styles.actions}>
            {actions.map((action) => (
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
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}
