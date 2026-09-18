---
title: 常见问题
description: 排查输入、键盘、列表、附件和消息交互中的接入问题。
---

# 常见问题

## 为什么点击发送后输入框没有清空？

Composer 是受控输入。发送事件交付当前原始文字，应用决定何时提交以及是否把 `value` 更新为空。组件不替应用发送网络请求。

## 键盘出现时，聊天区域由谁调整？

页面或抽屉宿主负责键盘避让。Chat 和 Composer 不额外抬升键盘；组合示例见 [主聊天](./composition/main-chat)与[抽屉输入](./composition/drawer-input)，避免多个宿主重复补偿高度。

## MessageList 为什么不显示或滚动不正常？

父容器需要有界高度，避免放入同方向无界 ScrollView。会话切换时使用 React `key` 重建对应列表；具体属性见 [MessageList API](./components/message-list)。

## 附件是否会自动上传？

不会。Attachments 展示调用方提供的项目、进度和状态，并交付操作事件。文件选择、上传、重试及业务结果采用由应用负责。

## 链接点击、确认和反馈会执行什么？

组件通过对应回调交付操作。应用决定打开链接、确认业务内容或提交反馈，库不连接 Agent，也不判定业务成功。

## Markdown 和图片由谁处理？

Message 使用 react-native-marked 渲染 Markdown，图片通过 Design 组件展示。支持范围以当前消息实现和依赖为准，不把消息内容当作业务指令执行。

[快速开始](./getting-started) · [组件索引](./components/chat)
