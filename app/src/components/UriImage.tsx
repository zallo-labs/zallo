import { makeStyles } from '@theme/makeStyles';
import { MaybeArray, toArray } from 'lib';
import { FC, useState } from 'react';
import { Image as BaseImage, ImageStyle, StyleProp, View } from 'react-native';
import { CircleSkeleton } from '~/components/skeleton/CircleSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { SvgUri } from './token/TokenIcon/SvgUri';

// https://reactnative.dev/docs/image#source
const SUPPORTED_FORMATS_PATTERN = /\.(svg|png|jpg|jpeg|bmp|gif|webp)$/i;

interface Style {
  style?: StyleProp<ImageStyle>;
}

export interface UriImageProps extends Style {
  uri: MaybeArray<string>;
  size?: number;
  Fallback?: FC<Style>;
}

const UriImage = ({ uri: uriProp, size, Fallback, style }: UriImageProps) => {
  const styles = useStyles(size);

  const uris = toArray(uriProp).filter((uri) => SUPPORTED_FORMATS_PATTERN.test(uri));
  const [selectedUri, selectUri] = useState(0);

  const [error, setError] = useState(false);
  if (error) return Fallback ? <Fallback style={[styles.icon, style]} /> : null;

  const uri = uris[selectedUri];
  if (uri.slice(-4).toLowerCase() === '.svg')
    return (
      <View style={style}>
        <SvgUri
          uri={uri}
          onError={() =>
            selectedUri < uris.length ? selectUri((selected) => selected + 1) : setError(true)
          }
          width={styles.icon.width}
          height={styles.icon.height}
        />
      </View>
    );

  return (
    <BaseImage
      source={uris.map((uri) => ({ uri }))}
      onError={() => setError(true)}
      resizeMode="contain"
      style={[styles.icon, style]}
    />
  );
};

const useStyles = makeStyles(({ iconSize }, size?: number) => ({
  icon: {
    width: size ?? iconSize.medium,
    height: size ?? iconSize.medium,
  },
}));

export default withSkeleton(UriImage, ({ size }) => <CircleSkeleton radius={size} />);
