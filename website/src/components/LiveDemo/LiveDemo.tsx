import BrowserOnly from '@docusaurus/BrowserOnly';
import { LiveDemoFrame } from './LiveDemoFrame';
import type { LiveDemoProps } from './types';
export function LiveDemo(props: LiveDemoProps) {
  return (
    <BrowserOnly
      fallback={<div className="chat-demo-loading">交互示例加载中…</div>}
    >
      {() => <LiveDemoFrame {...props} />}
    </BrowserOnly>
  );
}
