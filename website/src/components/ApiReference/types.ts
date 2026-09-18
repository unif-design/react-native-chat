import type api from '@site/static/md/api.json';
export interface ApiReferenceProps {
  name: keyof typeof api;
}
