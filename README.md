# @unif/react-native-chat

基于 `@unif/react-native-design` 的 TypeScript 聊天 UI 组件库，支持独立组件和完整聊天布局，可供其他 React Native 项目复用。

[组件源码](src/index.tsx) · [运行示例](example/README.md) · [常见问题](docs/FAQ.md) · [开发资料](docs/DEVELOPMENT.md)

## 提供什么

| 用途           | 组件                               |
| -------------- | ---------------------------------- |
| 聊天布局与消息 | Chat、MessageList、Message         |
| 输入与附件     | Composer、Attachments、Suggestions |
| 交互与反馈     | Confirmation、Process、Feedback    |
| 来源与引用     | Sources、Citation                  |

组件负责展示和事件；应用负责会话、草稿、文件上传、Agent 请求和业务处理。Markdown 使用 `react-native-marked`。

## 最小用法

在已配置 Design `ThemeProvider` 的应用中使用受控输入：

```tsx
import { useState } from 'react';
import { Composer } from '@unif/react-native-chat';

export function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');

  return (
    <Composer
      value={text}
      onChangeText={setText}
      primaryAction={{ kind: 'send', onPress: onSend }}
    />
  );
}
```

发送事件交付原始文字；发送后是否清空输入由应用决定。键盘避让由页面负责，MessageList 的父容器需要有界高度。

## 本地开始

从仓库根目录执行，Node 版本见 [.nvmrc](.nvmrc)：

```sh
yarn install --immutable --mode=skip-build
yarn example web
```

仓库自带 Yarn；没有全局命令时可用 `node .yarn/releases/yarn-4.11.0.cjs` 代替 `yarn`。原生示例及检查入口见 [example](example/README.md)。

## 文档

- [公共导出](src/index.tsx)与[组件类型](src/components/)：查询当前可用 API。
- [开发资料](docs/DEVELOPMENT.md)：架构契约、依赖说明和验证入口。
- [研发技能](https://github.com/unif-skill/unif-portal-dev-skills) · [贡献指南](CONTRIBUTING.md) · [MIT 许可](LICENSE)
