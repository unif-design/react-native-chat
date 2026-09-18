import type { ReactNode } from 'react';
export interface LiveDemoProps {
  children: ReactNode;
  height?: number;
  title?: string;
  toolbar?: boolean;
}
