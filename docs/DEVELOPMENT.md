# Chat 组件开发交接

## 范围与依据

本库实现独立聊天 UI，职责与公共接口由下面的 Chat 契约维护。

规范仓默认与本库并列。先读[Chat 架构与组件索引](../../unif-platform-architecture/libraries/react-native-chat.md)和[共同契约](../../unif-platform-architecture/libraries/react-native-chat/contracts.md)，再读取当前单元；详细 props 不在本库复制成第二套定义。

当前实现范围与单元清单以组件索引为准。

## 工程接线

- create-react-native-library 0.63.1，library/js 模板；库源码 TS/TSX，Bob 生成 ESM 和声明。Community CLI 原生 example 与 Vite Web 入口保持。
- 库名 @unif/react-native-chat，示例工作区 @unif/react-native-chat-example；React 19.2.3、RN 0.86.3、Design 0.32.0、Yarn 4.11.0。
- Design 从包根消费，Thumbnail 尺寸对象/fallback、Textarea/TextFieldHandle、CircularProgress 按 0.32.0 实际接口使用。详细接线见[组合验证](../../unif-platform-architecture/libraries/react-native-chat/composition.md#6-design-依赖与接入验证)。
- Markdown 使用 react-native-marked 8.2.0，归所属消息单元，不建立解析器、模型 SDK 或组件注册中心。
- Yarn 默认提升相同版本依赖，根库和 example 共用 React/原生模块实例；测试复用 Design 公开 preset。
- src/index.tsx 只导出真实实现；type-tests 验证依赖公开类型，example 验证公开消费。Git 忽略安装、构建和本地资料；npm files 只发布源码、构建产物及标准包说明。

现有上游 peer 声明有两处差异：RN eslint-config 的 ft-flow 2.x 要求 ESLint 8，脚手架采用 ESLint 9；Design 要求 RNGH 3，Carousel 5.0.0 仍声明 RNGH 小于 3。保留真实声明，不通过 resolutions 或忽略警告掩盖差异。基础输入测试不能证明 Carousel 原生/Web 手势兼容，后续验证实际消费链路。

当前依赖的 Web 差异：Design Button 的 disabled 状态经 RNGH 3.1.0／RN Web 0.21.2 未输出 `aria-disabled`，点击禁用仍生效；react-native-svg 15.15.5 将圆环 origin 转为 `transform-origin`，触发 React 19 的 DOM 属性开发警告。这两项属于基础依赖的 Web 接线，不能用 Chat 的 Jest 状态断言代替浏览器无障碍证据。

## 开发顺序与文件归属

1. Composer 与 Attachments：受控输入、原项事件、Design 输入/图片/进度，分别提供独立 example。
2. Message 与 MessageList：Markdown、长文、流式全文、前插、末尾跟随和嵌套点击。
3. Suggestions、Confirmation、Process、Feedback、Sources、Citation：各自的展示和明确事件。
4. 可选 Chat：组合已有组件形成主聊天和抽屉输入样例，不加载 Portal 或业务系统。

组件实现位于 `src/components/<组件名>/`，包根为 `src/index.tsx`；文件细则通过 AGENTS.md 指定的开发技能取得。

## 验证与交付

命令以 [package.json](../package.json) 及 [README](../README.md#本地开始) 为准。`src/components/<组件名>/__tests__/` 验证所属组件；`type-tests/` 验证包根公开消费和互斥类型；`example/src/examples/` 提供独立样例。`example/src/__tests__/App.test.tsx` 验证 Design 宿主，`Composition.test.tsx` 验证主聊天与抽屉的草稿、发送和移除交接。

[CI 配置](../.github/workflows/ci.yml)维护完整验证入口；提交检查见 [lefthook.yml](../lefthook.yml)，发布命令见 package.json。
