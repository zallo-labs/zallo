import { makeStyles } from '@theme/makeStyles';
import { FC, useState } from 'react';
import { Image as BaseImage, ImageStyle, StyleProp } from 'react-native';
import { CircleSkeleton } from '~/components/skeleton/CircleSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { SvgUri } from './token/TokenIcon/SvgUri';

interface Style {
  style?: StyleProp<ImageStyle>;
}

export interface UriImageProps extends Style {
  uri: string | string[];
  size?: number;
  Fallback?: FC<Style>;
}

const UriImage = ({ uri: uriProp, size, Fallback, style }: UriImageProps) => {
  const styles = useStyles(size);

  const uris = Array.isArray(uriProp) ? uriProp : [uriProp];

  const [error, setError] = useState(false);
  const handleError = () => setError(true);

  if (error || uris.length === 0)
    return Fallback ? <Fallback style={[style, styles.icon]} /> : null;

  const uri = uris[0];
  if (uri.slice(-4).toLowerCase() === '.svg')
    return (
      <SvgUri
        uri={uri}
        onError={handleError}
        style={style}
        width={styles.icon.width}
        height={styles.icon.height}
      />
    );

  return (
    <BaseImage
      source={uris.map((uri) => ({ uri }))}
      onError={handleError}
      resizeMode="contain"
      style={[style, styles.icon]}
    />
  );
};

const useStyles = makeStyles(({ iconSize }, size?: number) => ({
  icon: {
    width: size ?? iconSize.medium,
    height: size ?? iconSize.medium,
  },
}));

export default withSkeleton(UriImage, ({ size }) => (
  <CircleSkeleton radius={size} />
));
