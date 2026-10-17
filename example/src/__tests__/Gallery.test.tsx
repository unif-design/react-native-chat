import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { afterEach, expect, jest, test } from '@jest/globals';
import { FlatList, Image, Modal, Platform } from 'react-native';
import { ThemeProvider } from '@unif/react-native-design';
import { Attachments, Composer, MessageList } from '@unif/react-native-chat';
import App from '../App';
import { AttachmentsExample } from '../examples/AttachmentsExample/AttachmentsExample';
import { ComposerExample } from '../examples/ComposerExample/ComposerExample';
import { MessageExample } from '../examples/MessageExample/MessageExample';
import { MessageListExample } from '../examples/MessageListExample/MessageListExample';
import { MainChatExample } from '../examples/MainChatExample/MainChatExample';
import { DrawerInputExample } from '../examples/DrawerInputExample/DrawerInputExample';
import { STREAM_MESSAGE_CHUNKS } from '../examples/MessageExample/constants';
import { STREAM_GROWTH_CHUNKS } from '../examples/MessageListExample/constants';

const press = (name: string) =>
  fireEvent.press(screen.getByRole('button', { name }));
afterEach(async () => {
  await act(async () => {});
  jest.restoreAllMocks();
});

test('展厅可切换全部真实示例、主题和字号，并记录独立组件事件', () => {
  render(<App />);
  for (const label of ['切换深色', '切换浅色', '切换大字号', '恢复字号'])
    press(label);
  for (const label of [
    'Composer',
    'Attachments',
    'Message',
    'MessageList',
    'Suggestions',
    'Confirmation',
    'Process',
    'ProcessingProgress',
    'Sources',
    'Citation',
    'Feedback',
    'Chat 布局',
    '主聊天',
    '抽屉输入',
    'Design 接线',
  ]) {
    press(label);
  }
  press('Suggestions');
  press('查询客户');
  expect(screen.getByText('当前选择：customer')).toBeOnTheScreen();
  press('查看订单');
  expect(screen.getByText('当前选择：order')).toBeOnTheScreen();
  press('切换为静态展示');
  press('切换为可选择');
  press('Confirmation');
  press('确认');
  expect(screen.queryByRole('button', { name: '确认' })).toBeNull();
  press('Suggestions');
  press('Confirmation');
  press('取消');
  expect(screen.queryByRole('button', { name: '取消' })).toBeNull();
  press('Process');
  press('重新查询');
  expect(screen.getByText('已请求重新查询')).toBeOnTheScreen();
  press('Sources');
  press('1 当前客户资料');
  expect(screen.getByText('当前来源：customer')).toBeOnTheScreen();
  press('Citation');
  fireEvent.press(screen.getByRole('link'), { stopPropagation: jest.fn() });
  expect(screen.getByText('来源 1')).toBeOnTheScreen();
  press('Feedback');
  press('核实结果');
  expect(
    screen.getByText('已请求核实，等待调用方更新结果。')
  ).toBeOnTheScreen();
  press('Chat 布局');
  press('切换顶部和底部');
  expect(screen.queryByText('顶部内容')).toBeNull();
  press('切换顶部和底部');
  press('切换输入区域高度');
  expect(screen.getByText(/输入区域的额外内容/)).toBeOnTheScreen();
  press('切换输入区域高度');
  press('ProcessingProgress');
  for (const label of [
    '更新说明',
    '更换阶段',
    '长文案',
    '结束展示',
    '重新开始',
  ])
    press(label);
  expect(screen.getByRole('button', { name: '结束展示' })).toBeOnTheScreen();
});

test('附件示例在四种布局中保留预览、重试、移除和重置语义', () => {
  render(<AttachmentsExample />, { wrapper: ThemeProvider });
  const attachments = () => screen.UNSAFE_getByType(Attachments);
  for (const layout of ['列表', '网格', '紧凑', '混合', '横向', '图片预览']) {
    press(layout);
  }
  const first = attachments().props.items[0];
  act(() => attachments().props.onPreview(first));
  expect(
    screen.getByText(new RegExp(`预览原项：${first.id}`))
  ).toBeOnTheScreen();
  const retry = attachments().props.items.find(
    (item: { id: string }) => item.id === 'failed-file'
  );
  act(() => retry.actions[0].onPress());
  expect(screen.getByText('继续处理原项：failed-file')).toBeOnTheScreen();
  act(() => attachments().props.onRemove(first));
  expect(
    attachments().props.items.some(
      (item: { id: string }) => item.id === first.id
    )
  ).toBe(false);
  act(() => attachments().props.onPreview({ id: 'unnamed' }));
  expect(screen.getByText('预览原项：unnamed / 未命名附件')).toBeOnTheScreen();
  act(() => attachments().props.onRemove({ id: 'unnamed' }));
  expect(screen.getByText('移除原项：unnamed / 未命名附件')).toBeOnTheScreen();
  press('重置样例');
  expect(screen.getByText('已重置本地样例项')).toBeOnTheScreen();
});

test('输入示例完整交接发送、停止、语音、菜单、焦点和测量', () => {
  render(<ComposerExample />, { wrapper: ThemeProvider });
  press('载入长文');
  press('发送');
  expect(screen.getByText(/发送事件原文/)).toBeOnTheScreen();
  press('清空文字');
  press('允许空值发送');
  press('发送');
  press('禁止空值发送');
  press('停止动作');
  press('停止回复');
  expect(screen.getByText('收到停止回复事件')).toBeOnTheScreen();
  press('忙碌动作');
  expect(screen.getByRole('button', { name: '正在处理…' })).toBeDisabled();
  press('发送动作');
  const composer = () => screen.UNSAFE_getByType(Composer);
  act(() => composer().props.onFocusChange(true));
  expect(screen.getByText('焦点：已聚焦')).toBeOnTheScreen();
  act(() => composer().props.onFocusChange(false));
  act(() => composer().props.onHeightChange(96));
  expect(screen.getByText('Composer 高度：96')).toBeOnTheScreen();
  press('开始语音输入');
  expect(screen.getByText('收到开始语音事件')).toBeOnTheScreen();
  press('取消语音输入');
  for (const label of ['语音准备', '语音聆听', '语音收尾', '语音空闲'])
    press(label);
  act(() => composer().props.voice.onStop());
  expect(screen.getByText('收到停止语音事件')).toBeOnTheScreen();
  press('取消语音输入');
  expect(screen.getByText('收到取消语音事件')).toBeOnTheScreen();
  press('更多操作');
  press('拍摄照片');
  expect(screen.getByText('收到拍照入口事件')).toBeOnTheScreen();
  press('更多操作');
  press('选择文件');
  expect(screen.getByText('收到选择文件入口事件')).toBeOnTheScreen();
  for (const label of [
    '禁用文件操作',
    '恢复文件操作',
    '文件设为忙碌',
    '结束文件忙碌',
    '使用外层表面',
    '使用玻璃卡片',
    '聚焦输入',
    '输入失焦',
  ])
    press(label);
});

test('消息示例只采用有限增量并分别交付内容、失败和链接事件', () => {
  jest.spyOn(Image, 'getSize').mockImplementation(() => {});
  render(<MessageExample />, { wrapper: ThemeProvider });
  for (let i = 0; i <= STREAM_MESSAGE_CHUNKS.length; i++) press('追加下一段');
  expect(screen.getByText('固定增量已经全部采用')).toBeOnTheScreen();
  press('重置累计正文');
  expect(screen.getByText('已重置累计正文')).toBeOnTheScreen();
  press('继续原输入');
  expect(screen.getByText('已交付继续原输入事件')).toBeOnTheScreen();
  press('移除未发送图片');
  expect(screen.getByText('已收到移除未发送图片事件')).toBeOnTheScreen();
  press('业务卡片按钮');
  expect(screen.getByText('业务卡片按钮事件')).toBeOnTheScreen();
  fireEvent.press(screen.getByText('自定义业务卡片'), {
    target: 1,
    currentTarget: 1,
  });
  expect(screen.getByText('消息外壳点击事件')).toBeOnTheScreen();
  fireEvent.press(screen.getAllByRole('link')[0]!, {
    stopPropagation: jest.fn(),
  });
  expect(screen.getByText(/链接事件：/)).toBeOnTheScreen();
  press('显示正文');
  expect(screen.getByText(/正文已到达/)).toBeOnTheScreen();
  press('重新等待');
  expect(screen.getByRole('button', { name: '显示正文' })).toBeOnTheScreen();
});

test('列表示例保留历史错误和跟随开关，有限增量结束后可重置', () => {
  jest.spyOn(FlatList.prototype, 'scrollToOffset').mockImplementation(() => {});
  jest.spyOn(FlatList.prototype, 'scrollToIndex').mockImplementation(() => {});
  render(<MessageListExample />, { wrapper: ThemeProvider });
  const list = () => screen.UNSAFE_getByType(MessageList);
  press('前插更早消息');
  expect(screen.getByRole('button', { name: '前插更早消息' })).toBeDisabled();
  act(() => list().props.onRequestEarlier());
  press('追加消息');
  press('追加并顶锚');
  for (let i = 0; i <= STREAM_GROWTH_CHUNKS.length; i++) press('增长流式行');
  expect(screen.getByText(/固定流式增量已经全部采用/)).toBeOnTheScreen();
  for (const label of [
    '切换为 never',
    '启用末尾跟随',
    '以 start 重建',
    '以 end 重建',
    'ref 滚到末尾',
    '显示生成状态',
    '结束生成状态',
  ])
    press(label);
  press('显示历史错误');
  expect(
    screen.getByText('读取更早消息失败，当前消息保持不变。')
  ).toBeOnTheScreen();
  press('清除历史错误');
  act(() => list().props.onAtEndChange(false));
  expect(screen.getByText(/当前离开末尾/)).toBeOnTheScreen();
  press('重置 121 条');
  expect(list().props.items).toHaveLength(121);
});

test('Android主聊天可只发送附件，系统关闭抽屉保留原草稿', () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const page = render(<MainChatExample />, { wrapper: ThemeProvider });
  for (let i = 0; i < 2; i++) {
    press('更多操作');
    press('添加样例附件');
  }
  fireEvent.press(screen.getAllByRole('button', { name: '移除样例文档' })[0]!);
  press('发送');
  expect(screen.getByText('样例附件 1 个')).toBeOnTheScreen();
  page.rerender(<DrawerInputExample />);
  press('打开输入抽屉');
  fireEvent.changeText(screen.getByLabelText('抽屉消息输入框'), '保留草稿');
  fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
  press('打开输入抽屉');
  expect(screen.getByDisplayValue('保留草稿')).toBeOnTheScreen();
});
