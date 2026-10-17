# Chat 组件开发交接

## 范围与依据

本库实现独立聊天 UI，职责与公共接口由下面的 Chat 契约维护。

规范仓默认与本库并列。先读[Chat 架构与组件索引](../../unif-platform-architecture/libraries/react-native-chat.md)和[共同契约](../../unif-platform-architecture/libraries/react-native-chat/contracts.md)，再读取当前单元；详细 props 不在本库复制成第二套定义。

目标设计见上述契约；当前可用组件与类型以 [src/index.tsx](../src/index.tsx) 的实际导出为准。

## 工程接线

- create-react-native-library 0.63.1，library/js 模板；库源码 TS/TSX，Bob 生成 ESM 和声明。Community CLI 原生 example 与 Docusaurus Web 文档站分别验证原生和浏览器消费。
- 库名 @unif/react-native-chat，示例工作区 @unif/react-native-chat-example；React 19.3.0、RN 0.88.0、Design 1.6.2、Icons 0.4.1、Yarn 4.11.0。
- Design 从包根消费，Thumbnail 尺寸对象/fallback、Textarea（含 plain 表面）/TextFieldHandle、CircularProgress（formatLabel 仅改变视觉文字，读屏保留百分比）、ActionMenuContent（含 popover 展示）、ShimmerText 按 1.4.0 实际接口使用。Composer 的菜单开关与定位留在 Chat，菜单卡和菜单行由 Design 提供。处理中的文字扫光复用 ShimmerText，状态、文案和图标归 Chat。详细接线见[组合验证](../../unif-platform-architecture/libraries/react-native-chat/composition.md#6-design-依赖与接入验证)。
- Composer card、图片普通移除圆圈和中央状态／重试圆层复用 GlassLayer，plain 继续由外层提供表面；返回末尾操作复用 IconButton 的 glass 变体。交互 Suggestions、附件继续操作和 Confirmation 取消分别消费 Chip／secondary Button 的共享默认玻璃表面。材质、减少透明度和平台降级由 Design 处理，Chat 保留输入层级、浮菜单定位、附件独立触达区及滚动行为。失败附件仍使用错误色，消息正文与内容内轻量操作保留原层次。
- 本版本的 Design peer 为 `^1.4.0`；根库、example 与 Website 使用 `@callstack/liquid-glass` 0.8.2 满足 Design 的玻璃材质依赖。Jest 继续复用 Design preset，Web 通过 Design 的 Web 入口消费。
- Markdown 使用 react-native-marked 8.2.0，归所属消息单元，不建立解析器、模型 SDK 或组件注册中心。
- Yarn 默认提升相同版本依赖，根库和 example 共用 React/原生模块实例；测试复用 Design 公开 preset。
- src/index.tsx 只导出真实实现；type-tests 验证依赖公开类型，example 验证公开消费。Git 忽略安装、构建和本地资料；npm files 只发布源码、构建产物及标准包说明。

现有上游 peer 声明有两处差异：RN eslint-config 的 ft-flow 2.x 要求 ESLint 8，脚手架采用 ESLint 9；Design 要求 RNGH 3，Carousel 5.0.0 仍声明 RNGH 小于 3。保留真实声明，不通过 resolutions 或忽略警告掩盖差异。基础输入测试不能证明 Carousel 原生/Web 手势兼容，后续验证实际消费链路。

历史 Web 验证（RNGH 3.1.0／RN Web 0.21.2、react-native-svg 15.15.5）发现：Design Button 的 disabled 状态未输出 `aria-disabled`，点击禁用仍生效；SVG 将圆环 origin 转为 `transform-origin`，触发 React 19 的 DOM 属性开发警告。新基线的构建与资产注册验证不代表这两项浏览器行为已经复验；不能用 Chat 的 Jest 状态断言代替浏览器无障碍证据。

## 组件与文件归属

按本次组件读取实现、类型及对应 example。输入、附件、消息列表和交互反馈分别验证；Chat 组合现有组件，应用负责会话与业务流程。

组件实现位于 `src/components/<组件名>/`，包根为 `src/index.tsx`；文件细则通过 AGENTS.md 指定的开发技能取得。

### 材质覆盖

按公开导出及其内部交互入口核查；共享控件的表面由 Design 维护，Chat 不重复包装，也不通过新增材质参数改变业务状态。

| 公开组件           | 控制表面与内容边界                                                                                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Composer           | card 使用装饰 GlassLayer，plain 不绘制表面；浮菜单由 ActionMenuContent 提供。卡内 more／mic 保留透明操作，send／stop 保留主动作色，聆听区保留状态色。根容器允许浮菜单溢出。                                       |
| Attachments        | 普通移除和中央进度／处理／重试使用暗色 GlassLayer，继续操作使用 secondary Button；失败红色移除和描边保留。图片、文件行、名称、占位及行内预览／移除保持内容层次。中央圆层不裁切大字号百分比，点击 owner 保持独立。 |
| Message            | bubble／outlined／plain 与失败语义保留；失败只淡化自有纯文字／Markdown／状态说明，外部内容的材质祖先保持不透明。正文下操作继续使用 ghost／text，错误入口保留错误色。                                              |
| MessageWaiting     | 三点和等待说明，无控制表面。                                                                                                                                                                                      |
| MessageList        | 悬浮返回末尾按钮使用 glass IconButton，外层动画只缩放，不淡化材质祖先；列表内“查看更早消息”保留 text。                                                                                                            |
| Chat               | 只组合布局，无独立表面。                                                                                                                                                                                          |
| Suggestions        | 有 onSelect 时使用共享交互 Chip 的玻璃表面，无回调时保留静态标签。selected／loading／disabled 与原项事件保持受控。                                                                                                |
| Confirmation       | 取消使用共享 secondary Button 玻璃表面，确认保留 primary；内联确认内容卡与四种状态保留。                                                                                                                          |
| Process            | card／compact／timeline 的内容、展开入口、步骤动作和状态保持原契约。                                                                                                                                              |
| ProcessingProgress | 只显示行内状态文字，无控制表面。                                                                                                                                                                                  |
| Feedback           | tone 背景承载信息／成功／警告／错误语义，内容内操作保留 outline。                                                                                                                                                 |
| Sources            | 来源行承载可读内容，保留内容表面和原项点击。                                                                                                                                                                      |
| Citation           | 保持可嵌入正文的 Text 根节点和 link 语义。                                                                                                                                                                        |

每个单元的 `__tests__` 验证自身事件和状态；example 与 Web demo 消费真实公开组件。共享控件的原生材质、减少透明度和不支持平台由 Design 独立验证，Chat 的 Jest 结果不代替设备视觉验收。

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

## RN 0.88 开发基线与验证范围

根库、Community CLI example 和 Website 固定 React 19.3.0／RN 0.88.0；Reanimated 4.7.1、Worklets 0.13.0 与正式 Design 1.6.2 配套。CLI 20.2.0 及原生 example 按官方 `@react-native-community/template@0.88.0` 同步：iOS 采用 SceneDelegate，Android 采用 SDK 37、Kotlin 2.2.0、Gradle 9.4.1 及模板 AGP 9 兼容开关。库没有自有原生模块；example 原生文件是模板宿主接线，其编译与设备运行单独验证。

SVG 15.16.0 在原生端使用 RN 0.87+ 资源解析接口；Website 按上游 Webpack 说明显式安装 `@react-native/assets-registry@0.88.0`，配合 RN Web 0.21.4 [正式公开的 AssetRegistry](https://github.com/necolas/react-native-web/releases/tag/0.21.4)；该兼容包的混合模块格式由 Babel 转换，共享 Web 消费者的资产注册表。

Jest 统计全部 `src/**/*.{ts,tsx}` 与 `example/src/**/*.{ts,tsx}`，仅排除测试文件，语句、分支、函数、行门禁均为 100%。测试保留真实组件、Markdown 解析、状态和列表锚点逻辑，只替换原生布局、图片尺寸与浏览器观察器等外部边界。文档工具测试、Website 构建、Metro bundle、原生编译、远端 CI 和真机验收分别记录，不能用运行时覆盖率代替它们。

### 原生宿主与构建工具

iOS example 使用 Ruby 3.3+，`example/Gemfile.lock` 固定 CocoaPods 1.17.0、ActiveSupport 7.2.4 与 xcodeproj 1.28.1；在 `example/` 执行 `bundle install`，再到 `example/ios/` 执行 `bundle exec pod install --deployment`。提交的 Podfile.lock 与实际 RN 0.88 构建一致。该组合已通过真实 iOS 设备 SDK 的无签名 Debug 编译；Android example 的 `:app:assembleDebug -PreactNativeArchitectures=arm64-v8a` 已通过。设备安装、交互和远端 CI 另行验收。

`yarn test:native` 直接插桩 example 的两个 Kotlin 文件以及 AppDelegate／SceneDelegate 原始 Swift 文件，分别执行 Swift Debug 和 Release。测试替换外部 RN／UIKit 接口，断言宿主启动、依赖与窗口接线、场景筛选、链接转发及资源查找；Android 断言宿主延迟创建和 Fabric 开关。脚本校验完整源码清单与哈希，输出各工具原始报告；编译器没有产生的分支计数标为 N/A。JaCoCo 0.8.13 从官方 Maven 获取并核对固定 SHA256，可通过 `JACOCO_HOME` 复用同版本已校验缓存。宿主行为覆盖与真实 SDK 编译分别执行。
