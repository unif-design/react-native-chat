# @unif/react-native-chat

React Native 聊天 UI 组件，提供消息列表、输入、附件和交互反馈，可独立使用或组合完整聊天页。组件负责展示与事件，会话、上传和业务请求由应用处理。

[文档站](https://unif-design.github.io/react-native-chat/) · [npm](https://www.npmjs.com/package/@unif/react-native-chat) · [运行示例](example/README.md)

## 安装

| 依赖         | 支持要求           |
| ------------ | ------------------ |
| React Native | `>=0.86.0`         |
| React        | `>=19.2.3 <20.0.0` |
| Unif Design  | `^1.7.0`           |

```sh
yarn add @unif/react-native-chat
```

继续按[安装与宿主](website/docs/getting-started.mdx)补齐 Icons、Liquid Glass、SVG 及 Design 所需依赖，并配置主题、手势和安全区。完整 peer 范围见 [package.json](package.json)。

## 最小用法

在已配置 Design `ThemeProvider` 的应用中放入受控输入；`onSend` 由所属页面提供：

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

发送事件交付原始文字，是否提交或清空草稿由应用决定。页面负责键盘避让；使用消息列表时，还需给 MessageList 有界高度。

## 本地开始

运行原生示例或 Web 文档站见[示例说明](example/README.md)；源码维护、契约和检查入口见[开发资料](docs/DEVELOPMENT.md)。

## 进一步使用

| 需要做什么         | 文档                                                  |
| ------------------ | ----------------------------------------------------- |
| 选择组件、查询 API | [组件概览](website/docs/components/overview.mdx)      |
| 组合完整聊天页     | [主聊天](website/docs/composition/main-chat.mdx)      |
| 在抽屉中放置输入区 | [抽屉输入](website/docs/composition/drawer-input.mdx) |
| 排查接入问题       | [常见问题](website/docs/faq.md)                       |

[库能力技能](website/docs/skills.md) · [AI 文档索引](https://unif-design.github.io/react-native-chat/llms.txt) · [贡献指南](CONTRIBUTING.md) · [MIT 许可](LICENSE)
