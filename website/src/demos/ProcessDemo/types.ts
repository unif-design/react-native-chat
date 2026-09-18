import type { ProcessStepStatus } from '@unif/react-native-chat';

export interface ProcessDemoStep {
  id: string;
  title: string;
  description: string;
  status: ProcessStepStatus;
  elapsedMs?: number;
}
