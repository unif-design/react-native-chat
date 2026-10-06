export interface MarkdownContentProps {
  text: string;
  onLinkPress?(url: string): void;
  outgoing?: boolean;
}

export interface MarkdownSvgLabelProps {
  alt?: string;
}
