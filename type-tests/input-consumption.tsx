import { createRef } from 'react';
import { Text, View } from 'react-native';
import { Attachments, Composer } from '@unif/react-native-chat';
import type {
  AttachmentsProps,
  ChatAttachmentItem,
  ComposerHandle,
  ComposerProps,
  ComposerVoiceControl,
} from '@unif/react-native-chat';

const composerRef = createRef<ComposerHandle>();
const voice: ComposerVoiceControl = {
  status: 'listening',
  transcript: '识别中的文字',
  onStart: () => undefined,
  onStop: () => undefined,
  onCancel: () => undefined,
};
const composerProps: ComposerProps = {
  value: '商品甲两箱',
  onChangeText: () => undefined,
  primaryAction: {
    kind: 'send',
    allowEmpty: true,
    onPress: (value) => value.length,
  },
  voice,
  actions: [
    {
      id: 'pick-file',
      label: '选择文件',
      icon: 'paperclip',
      onPress: () => undefined,
    },
  ],
  header: <Text>附件位置</Text>,
  footer: <Text>说明位置</Text>,
  onFocusChange: (focused) => focused,
  onHeightChange: (height) => height,
};

const attachment: ChatAttachmentItem = {
  id: 'photo',
  name: '商品照片',
  kind: 'image',
  status: 'uploading',
  progress: 0.5,
  loadingVisual: 'center',
  thumbnail: {
    uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB',
  },
  previewable: true,
  removable: true,
};
const attachmentsProps: AttachmentsProps = {
  items: [attachment],
  layout: 'carousel',
  showProgressLabel: true,
  onPreview: (item) => item.id,
  onRemove: (item) => item.id,
};

export const inputConsumption = (
  <View>
    <Composer ref={composerRef} {...composerProps} />
    <Attachments {...attachmentsProps} />
  </View>
);

// @ts-expect-error Composer ref 只提供 focus 与 blur。
composerRef.current?.clear();

export const invalidComposerPrimaryAction = (
  <Composer
    value=""
    onChangeText={() => undefined}
    // @ts-expect-error busy 主动作没有 onPress。
    primaryAction={{ kind: 'busy', onPress: () => undefined }}
  />
);

export const invalidAttachmentsLayout = (
  // @ts-expect-error Attachments 只接受四种已声明布局。
  <Attachments items={[]} layout="stack" />
);
