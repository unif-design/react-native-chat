# Chat 示例

通过包根公开 API 展示聊天组件，提供 Community CLI 原生示例；Web 使用 Docusaurus 文档站。

## 运行

按仓库的 [.nvmrc](../.nvmrc) 准备 Node，以下命令在仓库根目录执行：

```sh
yarn install --immutable --mode=skip-build
yarn web
```

仓库自带 Yarn；没有全局命令时，可用 `node .yarn/releases/yarn-4.11.0.cjs` 代替 `yarn`。

Web 文档站展示组件 API 与交互示例；原生示例启动 Metro 使用 `yarn example start`。iOS、Android 的构建与完整测试由 CI 执行；开展真机测试时使用对应的 `yarn example ios --device` 或 `yarn example android`。

iOS 首次运行或原生依赖变化后，先在 `example/` 执行 `bundle install`，再执行 `bundle exec pod install --project-directory=ios`。环境与原生配置见[开发资料](../docs/DEVELOPMENT.md#原生宿主与构建工具)。

## 可以查看什么

| 入口        | 内容                                                                                                                                   |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 独立组件    | Composer、Attachments、Message、MessageList、Suggestions、Confirmation、Process、ProcessingProgress、Sources、Citation、Feedback、Chat |
| 主聊天      | 消息、受控草稿、发送及附件移除的组合                                                                                                   |
| 抽屉输入    | 独立草稿与键盘宿主的组合                                                                                                               |
| Design 接线 | 基础输入、浅色／深色和应用字号                                                                                                         |

完整入口见[示例索引](src/ExampleGallery/constants.ts)。样例使用本地状态和事件，不连接 Agent 或业务系统。

## 验证

从仓库根目录运行类型与单文件接线检查：

```sh
yarn typecheck
yarn example typecheck
yarn test --runInBand --runTestsByPath example/src/__tests__/App.test.tsx
yarn test:native
```

原生宿主测试与边界替身位于 `android/__tests__`、`ios/__tests__`；环境要求、覆盖清单与验证范围见[原生宿主测试](NATIVE_TESTS.md)。

实际平台需检查键盘、滚动锚点、动态高度、图片、嵌套点击和大字号；定向测试不代替这些交互验收。更多依据见[开发资料](../docs/DEVELOPMENT.md)。
