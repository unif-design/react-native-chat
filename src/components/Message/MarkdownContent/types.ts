export interface MarkdownContentProps {
  text: string;
  onLinkPress?(url: string): void;
}

export interface MarkdownSvgLabelProps {
  alt?: string;
}
