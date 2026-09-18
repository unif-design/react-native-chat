import CodeBlock from '@theme/CodeBlock';
import api from '@site/static/md/api.json';
import type { ApiReferenceProps } from './types';

export function ApiReference({ name }: ApiReferenceProps) {
  return (
    <details className="chat-api">
      <summary>查看完整 TypeScript 类型</summary>
      <p>以下内容由包根公开类型生成，与当前源码保持一致。</p>
      <CodeBlock language="ts">{api[name]}</CodeBlock>
    </details>
  );
}
