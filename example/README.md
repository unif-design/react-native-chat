# Chat 原生示例

工作区名 `@unif/react-native-chat-example`，原生名 `ReactNativeChatExample`。使用 Community CLI；Web 组件文档和交互示例统一由根目录 `website/` 提供，使用 `yarn web` 启动。

原生入口包含 11 个独立组件、主聊天和抽屉输入示例，共用 GestureHandlerRootView、SafeAreaProvider 与 Design ThemeProvider。草稿、消息及附件状态由示例维护，不接业务服务。

从仓库根目录运行 `yarn example start` 启动 Metro。原生构建和全量测试在 CI 执行；实际设备上的键盘、图片和手势分别验收。
