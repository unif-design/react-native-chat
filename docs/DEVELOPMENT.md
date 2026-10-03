# Chat 组件开发交接

## 范围与依据

本库实现独立聊天 UI，职责与公共接口由下面的 Chat 契约维护。

规范仓默认与本库并列。先读[Chat 架构与组件索引](../../unif-platform-architecture/libraries/react-native-chat.md)和[共同契约](../../unif-platform-architecture/libraries/react-native-chat/contracts.md)，再读取当前单元；详细 props 不在本库复制成第二套定义。

目标设计见上述契约；当前可用组件与类型以 [src/index.tsx](../src/index.tsx) 的实际导出为准。

## 工程接线

- create-react-native-library 0.63.1，library/js 模板；库源码 TS/TSX，Bob 生成 ESM 和声明。Community CLI 原生 example 与 Docusaurus Web 文档站分别验证原生和浏览器消费。
- 库名 @unif/react-native-chat，示例工作区 @unif/react-native-chat-example；React 19.2.3、RN 0.86.3、Design 0.33.0、Yarn 4.11.0。
- Design 从包根消费，Thumbnail 尺寸对象/fallback、Textarea（含 plain 表面）/TextFieldHandle、CircularProgress 按 0.33.0 实际接口使用。详细接线见[组合验证](../../unif-platform-architecture/libraries/react-native-chat/composition.md#6-design-依赖与接入验证)。
- Markdown 使用 react-native-marked 8.2.0，归所属消息单元，不建立解析器、模型 SDK 或组件注册中心。
- Yarn 默认提升相同版本依赖，根库和 example 共用 React/原生模块实例；测试复用 Design 公开 preset。
- src/index.tsx 只导出真实实现；type-tests 验证依赖公开类型，example 验证公开消费。Git 忽略安装、构建和本地资料；npm files 只发布源码、构建产物及标准包说明。

现有上游 peer 声明有两处差异：RN eslint-config 的 ft-flow 2.x 要求 ESLint 8，脚手架采用 ESLint 9；Design 要求 RNGH 3，Carousel 5.0.0 仍声明 RNGH 小于 3。保留真实声明，不通过 resolutions 或忽略警告掩盖差异。基础输入测试不能证明 Carousel 原生/Web 手势兼容，后续验证实际消费链路。

当前依赖的 Web 差异：Design Button 的 disabled 状态经 RNGH 3.1.0／RN Web 0.21.2 未输出 `aria-disabled`，点击禁用仍生效；react-native-svg 15.15.5 将圆环 origin 转为 `transform-origin`，触发 React 19 的 DOM 属性开发警告。这两项属于基础依赖的 Web 接线，不能用 Chat 的 Jest 状态断言代替浏览器无障碍证据。

## 组件与文件归属

按本次组件读取实现、类型及对应 example。输入、附件、消息列表和交互反馈分别验证；Chat 组合现有组件，应用负责会话与业务流程。

组件实现位于 `src/components/<组件名>/`，包根为 `src/index.tsx`；文件细则通过 AGENTS.md 指定的开发技能取得。

## 文档站

`website/` 沿用 Design 的 Docusaurus 站点形式。`yarn web` 启动文档站；`yarn website typecheck` 检查 Web 消费。组件页的 API 从包根类型导出生成，MDX 是文档与 llms 资料的共同来源，生成产物不手改。构建及 GitHub Pages 部署使用组织标准 CI。

## 验证与交付

命令以 [package.json](../package.json) 及 [README](../README.md#本地开始) 为准。`src/components/<组件名>/__tests__/` 验证所属组件；`type-tests/` 验证包根公开消费和互斥类型；`example/src/examples/` 提供独立样例。`example/src/__tests__/App.test.tsx` 验证 Design 宿主，`Composition.test.tsx` 验证主聊天与抽屉的草稿、发送和移除交接。

[CI 配置](../.github/workflows/ci.yml)维护完整验证入口；提交检查见 [lefthook.yml](../lefthook.yml)，发布命令见 package.json。

LLM 索引、链接与产物提交采用组织共用生成器；本库保留由公开类型生成 API 文本的转换。网站 API 展示和 Markdown 使用同一个 md/api.json 来源，生成失败不交付半套资料。

## 2026-09-30 MessageList 优化验证

基于 `00ea125`，把滚动测量与跟随整理到所属私有 hook，稳定 FlatList 的回调与展示输入，按项、索引、前项、renderer 和 extraData 复用行。Web 锚点继续响应实际 DOM / 尺寸变化，相同列表输入的父级刷新不再重复扫描行节点。公开接口和原有滚动行为不变。

新增回归先确认旧实现 3 项性能断言失败、4 项显示更新保护通过；Web 另有 1 项重复扫描断言失败。初版优化的 Bob 和文档站构建通过。

审查补充了 header 仅改变高度的回归：行和视口尺寸不变时，下一次前插应补偿 100，修复前错误补偿 180。真实浏览器还复现了 header 增高 80、footer 同时缩短 80 的情况：内容总高不变，仅观察内容容器仍会遗漏锚点位移。核对 RN Web 0.21.2 的 ScrollView 与 VirtualizedList 实现后，通过滚动节点的 `getInnerViewNode()` 取得内容容器，将容器及其直接子包装节点加入已有 ResizeObserver。没有扩大到属性变化观察；节点替换时解除旧目标，卸载时释放观察器、监听与待执行帧。

两种高度变化、内容节点与 header 包装节点替换均先有失败回归，修复后与行尺寸变化、前插、相同输入不扫描及卸载清理一起通过。最终定向测试为 3 suites / 19 tests，库与 example 的完整 Jest 为 17 suites / 109 tests，类型检查与 Bob 构建通过。Lint 为 0 errors，保留 5 个既有 warnings。

真实 MessageList + RN FlatList 的 Jest renderer 中，1000 条数据保持同一引用、keyExtractor 和 renderItem 稳定时，一次父级重渲染从 1023 次取 key / 10 次行渲染降为 0 / 0；仅更新屏外一项时，可见行渲染从 10 次降为 0。只改变一条可见消息时只重渲染该行。extraData、renderer 变化、分隔符前项、前插和重排索引均有行为保护。这些是调用次数，不代表设备帧耗时。

IAB 真实浏览器另用 React 19.2.3、RN Web 0.21.2 和当前 MessageList／Web hook 完成两种前插验收。普通场景从 header 100 增至 180，前插 100 后锚点仍为 180、scrollTop 为 100、内容高为 1408；抵消场景在 header 增高时内容高保持 1228，前插后锚点仍为 180、scrollTop 为 100、内容高为 1328。两者锚点位移均为 0。样例仅对未启用的 Design 按钮和 spacing 导入提供边界替身，未替换 FlatList、布局算法或浏览器观察器。以上证明这两个 Web 布局场景，手机长列表性能、原生动态高度与键盘仍需设备验收。
