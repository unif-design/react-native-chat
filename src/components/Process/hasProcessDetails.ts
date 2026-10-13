import { Children } from 'react';
import type { ReactNode } from 'react';

export function hasProcessDetails(details: ReactNode): boolean {
  return Children.toArray(details).some((child) => child !== '');
}
