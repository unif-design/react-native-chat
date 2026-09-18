import type { EXAMPLES } from './constants';
export type ExampleName = (typeof EXAMPLES)[number]['id'];
export interface ExampleGalleryProps {
  onToggleTheme(): void;
  onToggleFont(): void;
}
