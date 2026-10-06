import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  useMemo,
} from 'react';
import { Pressable, Text } from 'react-native';
import { Renderer, useMarkdown } from 'react-native-marked';
import { useTheme, useThemedStyles } from '@unif/react-native-design';
import { createStyles, createOutgoingStyles } from './styles';
import type { MarkdownContentProps, MarkdownSvgLabelProps } from './types';
import { MarkdownImage } from './MarkdownImage/MarkdownImage';

export function MarkdownContent({
  text,
  onLinkPress,
  outgoing = false,
}: MarkdownContentProps) {
  const { scheme } = useTheme();
  const styles = useThemedStyles(
    outgoing ? createOutgoingStyles : createStyles
  );
  const markdown = useMemo(() => {
    const instance = new Renderer();
    const renderCode = instance.code.bind(instance);
    instance.code = (value, language, containerStyle, textStyle) =>
      renderCode(value, language, containerStyle, {
        ...textStyle,
        ...styles.codeText,
      });
    // 上游 table 节点未提供 key，保留其渲染并补齐稳定的节点身份。
    const renderTable = instance.table.bind(instance);
    instance.table = (...args) => (
      <Fragment key={instance.getKey()}>{renderTable(...args)}</Fragment>
    );
    const renderImage = instance.image.bind(instance);
    instance.image = (uri, alt, imageStyle, title) => {
      // 沿用上游的 SVG 识别与加载，位图适配只避免重复测量。
      if (uri.endsWith('.svg')) {
        const image = renderImage(uri, alt, imageStyle, title);
        // 上游 SVG 节点支持 alt，但 Renderer 未转交 Markdown 的标签。
        return isValidElement<MarkdownSvgLabelProps>(image)
          ? cloneElement(image, { alt: alt || title || undefined })
          : image;
      }
      return (
        <MarkdownImage key={instance.getKey()} uri={uri} label={alt || title} />
      );
    };
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
