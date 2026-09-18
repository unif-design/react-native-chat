# @unif/react-native-chat

基于 `@unif/react-native-design` 的独立 TypeScript 聊天组件库。

工程由 create-react-native-library 0.63.1 的 library/js 模板生成，源码为 TS/TSX。example 使用 Community CLI，原生 iOS/Android 工程用于示例验证，Docusaurus 文档站提供 Web 交互预览。公开组件包括 Chat、Message、MessageList、Composer、Attachments、Suggestions、Confirmation、Process、Sources、Citation、Feedback。各组件可以独立使用，具体行为依据见[开发交接](docs/DEVELOPMENT.md)。

[组件文档与交互示例](https://unif-design.github.io/react-native-chat/)

## 本地开始

仓库自带 Yarn 4.11.0；Node 基线见 .nvmrc，支持范围见 package.json。

```sh
yarn install --immutable --mode=skip-build
yarn typecheck
yarn example typecheck
yarn lint
yarn format:check
yarn test --runInBand --runTestsByPath example/src/__tests__/App.test.tsx
```

没有全局 Yarn 时，使用 `node .yarn/releases/yarn-4.11.0.cjs` 代替 yarn。示例服务使用 `yarn example start` 或 `yarn web`。构建和全量测试遵循 AGENTS.md 的执行边界。

Design 开发和示例使用 npm 0.32.0，React 19.2.3、RN 0.86.3；公开依赖范围以 package.json 为准。已知上游 peer 声明差异见开发交接。

ESLint、Jest、Lefthook、Release It 已配置。跳过安装脚本时，使用 `yarn exec lefthook install` 安装 Git hooks；发布按明确授权执行。

## 使用与示例

应用根使用 Design 的 `ThemeProvider`，按应用需要接入手势与安全区宿主。组件从包根具名导入；公开类型由 `src/index.tsx` 导出，详细 props 以所属单元 `types.ts` 为准。

```tsx
import { Composer } from '@unif/react-native-chat';

<Composer
  value={text}
  onChangeText={setText}
  primaryAction={{ kind: 'send', onPress: handleSend }}
/>;
```

`handleSend` 接收原始文字，调用方负责请求、结果采用以及更新 `text`。停止、附件操作、确认、来源与反馈按钮同样只交付事件。库不创建会话、上传文件、连接 Agent 或自行判断业务成功。

example 首页可切换 11 个组件的独立样例、主聊天与抽屉输入，并切换浅色／深色和应用字号。Message 包含真实 Markdown、图片和交互卡片；MessageList 提供长列表、前插与追加、流式增长和跟随设置。主聊天和抽屉样例分别持有草稿，通过 RN 键盘容器演示宿主责任；Chat 和 Composer 不额外抬升键盘。

MessageList 需要有界高度，不要放入同方向无界 ScrollView。列表采用 FlatList；RN Web 0.21 的纯前插通过可见消息的 DOM 位置保持锚点，持续处理后续尺寸变化；虚拟化仍由 FlatList 管理。切换会话使用 React key 重建列表。

Markdown 使用 react-native-marked 的公开解析和节点渲染；链接仅交付 onLinkPress。图片通过小型资源尺寸适配与 Design Thumbnail 呈现，避免当前第三方图片节点重复取尺寸，同时保留 Design 的加载与失败占位。Jest 配置沿用 Design preset，额外转换 Markdown 的 ESM 依赖。

定向交互测试不能代替真实平台验收。键盘、动态高度、滚动锚点、图片、嵌套触摸与大字号布局应在 Web、iOS、Android 分别检查；完整 Jest、库与 example 打包及原生构建由 CI 执行。
