import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { Icon, Thumbnail } from '@unif/react-native-design';
import { styles } from './styles';
import type { ImageRatio, MarkdownImageProps } from './types';

export function MarkdownImage({ uri, label }: MarkdownImageProps) {
  const [width, setWidth] = useState(1);
  const [ratio, setRatio] = useState<ImageRatio | undefined>(undefined);
  useEffect(() => {
    let active = true;
    // 只取资源几何；加载与失败占位仍由 Design Thumbnail 持有。
    Image.getSize(
      uri,
      (imageWidth, imageHeight) => {
        if (
          active &&
          Number.isFinite(imageWidth) &&
          Number.isFinite(imageHeight) &&
          imageWidth > 0 &&
          imageHeight > 0
        ) {
          setRatio({ uri, value: imageWidth / imageHeight });
        }
      },
      () => {}
    );
    return () => {
      active = false;
    };
  }, [uri]);
  return (
    <View
      style={styles.root}
      onLayout={({ nativeEvent: { layout } }) =>
        setWidth(Math.max(1, layout.width))
      }
    >
      <Thumbnail
        source={{ uri }}
        size={{
          width,
          height: width / (ratio?.uri === uri ? ratio.value : 1),
          borderRadius: 0,
        }}
        resizeMode="contain"
        fallback={<Icon name="image" />}
        accessibilityLabel={label || '图片'}
      />
    </View>
  );
}
