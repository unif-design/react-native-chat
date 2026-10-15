import { createRef } from 'react';
import { View } from 'react-native';
import {
  CircularProgress,
  ShimmerText,
  Textarea,
  Thumbnail,
} from '@unif/react-native-design';
import type {
  TextFieldHandle,
  ThumbnailDimensions,
} from '@unif/react-native-design';
const dimensions: ThumbnailDimensions = {
  width: 76,
  height: 76,
  borderRadius: 8,
};
const inputRef = createRef<TextFieldHandle>();
export const designConsumption = (
  <View>
    <Thumbnail
      source={{ uri: 'https://example.invalid/fixture.jpg' }}
      size={dimensions}
      fallback={<View />}
    />
    <Textarea
      value=""
      onChangeText={() => undefined}
      minHeight={44}
      maxHeight={120}
      ref={inputRef}
    />
    <CircularProgress value={0.5} showLabel />
    <ShimmerText active numberOfLines={1}>
      思考中
    </ShimmerText>
  </View>
);
// @ts-expect-error 明确图像框仍必须同时提供宽高。
export const invalidDimensions: ThumbnailDimensions = { width: 76 };
