export interface MarkdownContentProps {
  text: string;
  onLinkPress?(url: string): void;
}
