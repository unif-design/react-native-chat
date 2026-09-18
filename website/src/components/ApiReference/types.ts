import type api from '@site/src/generated/api.json';
export interface ApiReferenceProps {
  name: keyof typeof api;
}
