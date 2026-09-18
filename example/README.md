# Chat 示例

通过包根公开 API 展示聊天组件，提供 Community CLI 原生示例；Web 使用 Docusaurus 文档站。

## 运行

以下命令在仓库根目录执行：

```sh
yarn install --immutable --mode=skip-build
yarn web
```

Web 文档站展示组件 API 与交互示例；原生示例启动 Metro 使用 `yarn example start`。iOS、Android 的构建与完整测试由 CI 执行；开展真机测试时使用对应的 `yarn example ios` 或 `yarn example android`。

## 可以查看什么

| 入口        | 内容                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| 独立组件    | Composer、Attachments、Message、MessageList、Suggestions、Confirmation、Process、Sources、Citation、Feedback、Chat |
| 主聊天      | 消息、受控草稿、发送及附件移除的组合                                                                               |
| 抽屉输入    | 独立草稿与键盘宿主的组合                                                                                           |
| Design 接线 | 基础输入、浅色／深色和应用字号                                                                                     |

完整入口见[示例索引](src/ExampleGallery/constants.ts)。样例使用本地状态和事件，不连接 Agent 或业务系统。

## 验证

从仓库根目录运行类型与单文件接线检查：

```sh
yarn typecheck
yarn example typecheck
yarn test --runInBand --runTestsByPath example/src/__tests__/App.test.tsx
```

实际平台需检查键盘、滚动锚点、动态高度、图片、嵌套点击和大字号；定向测试不代替这些交互验收。更多依据见[开发资料](../docs/DEVELOPMENT.md)。
