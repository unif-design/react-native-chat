import { Children, Fragment, useMemo } from 'react';
import { Pressable, Text } from 'react-native';
import { Renderer, useMarkdown } from 'react-native-marked';
import { useTheme, useThemedStyles } from '@unif/react-native-design';
import { createStyles } from './styles';
import type { MarkdownContentProps } from './types';
import { MarkdownImage } from './MarkdownImage/MarkdownImage';

export function MarkdownContent({ text, onLinkPress }: MarkdownContentProps) {
  const { scheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const markdown = useMemo(() => {
    const instance = new Renderer();
    // 上游 table 节点未提供 key，保留其渲染并补齐稳定的节点身份。
    const renderTable = instance.table.bind(instance);
    instance.table = (...args) => (
      <Fragment key={instance.getKey()}>{renderTable(...args)}</Fragment>
    );
    instance.image = (uri, alt, _imageStyle, title) => (
      <MarkdownImage key={instance.getKey()} uri={uri} label={alt || title} />
    );
    instance.link = (children, href, linkStyle, title) => (
      <Text
        key={instance.getKey()}
        selectable
        style={linkStyle}
        accessibilityRole={onLinkPress ? 'link' : undefined}
        accessibilityLabel={
          title || (typeof children === 'string' ? children : undefined)
        }
        onPress={
          onLinkPress
            ? (event) => {
                event.stopPropagation();
                onLinkPress(href);
              }
            : undefined
        }
      >
        {children}
      </Text>
    );
    instance.linkImage = (href, uri, alt, imageStyle, title) => {
      const content = instance.image(uri, alt, imageStyle, title);
      return onLinkPress ? (
        <Pressable
          key={instance.getKey()}
          accessibilityRole="link"
          accessibilityLabel={alt || title || '图片链接'}
          onPress={(event) => {
            event.stopPropagation();
            onLinkPress(href);
          }}
        >
          {content}
        </Pressable>
      ) : (
        content
      );
    };
    return { renderer: instance, text, styles };
    // Renderer 的 key 计数按每次解析重新开始，流式正文保留已有图片节点。
  }, [onLinkPress, text, styles]);
  const nodes = useMarkdown(markdown.text, {
    renderer: markdown.renderer,
    colorScheme: scheme,
    styles: markdown.styles,
  });
  return <>{Children.toArray(nodes)}</>;
}
