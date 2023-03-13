import { makeStyles } from '@theme/makeStyles';
import { Arraylike, toArray } from 'lib';
import { FC, useCallback, useState } from 'react';
import { StyleProp, View } from 'react-native';
import { CircleSkeleton } from '~/components/skeleton/CircleSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { SvgUri } from './token/TokenIcon/SvgUri';
import FastImage, { ImageStyle as FiImageStyle } from 'react-native-fast-image';

export type ImageStyle = FiImageStyle;

interface Style {
  style?: StyleProp<ImageStyle>;
}

export interface ImageProps extends Style {
  source: Arraylike<string>;
  size?: number;
  fallback?: FC<Style>;
}

export const Image = withSkeleton(
  ({ source: sourceProp, size, fallback: Fallback, style }: ImageProps) => {
    const styles = useStyles(size);

    const sources = toArray(sourceProp);
    const [index, setIndex] = useState(0);

    const onError = useCallback(
      () => setIndex((index) => (index < sources.length ? index + 1 : -1)),
      [sources.length],
    );

    if (index === -1)
      return Fallback ? <Fallback style={[styles.icon, style]} /> : <View style={style} />;

    const source = sources[index];
    if (source.slice(-4).toLowerCase() === '.svg')
      return (
        <View style={style}>
          <SvgUri
            source={source}
            onError={onError}
            width={styles.icon.width}
            height={styles.icon.height}
          />
        </View>
      );

    return (
      <FastImage
        source={{ uri: source }}
        onError={onError}
        resizeMode="contain"
        style={[styles.icon, style]}
      />
    );
  },
  ({ size }) => <CircleSkeleton radius={size} />,
);

const useStyles = makeStyles(({ iconSize }, size?: number) => ({
  icon: {
    width: size ?? iconSize.medium,
    height: size ?? iconSize.medium,
  },
}));
