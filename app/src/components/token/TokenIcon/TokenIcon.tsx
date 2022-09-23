import { makeStyles } from '@theme/makeStyles';
import { Token } from '@token/token';
import { useState } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { LabelIcon } from '~/components/Identicon/LabelIcon';
import { CircleSkeleton } from '~/components/skeleton/CircleSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { SvgUri } from './SvgUri';

export interface TokenIconProps {
  token: Token;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

const TokenIcon = ({
  token: { iconUri, symbol },
  size,
  style,
}: TokenIconProps) => {
  const styles = useStyles(size);

  const [fallback, setFallback] = useState(false);
  const handleError = () => setFallback(true);

  if (fallback)
    return <LabelIcon label={symbol} style={[style, styles.icon]} />;

  if (iconUri.slice(-4).toLowerCase() === '.svg')
    return (
      <SvgUri
        uri={iconUri}
        onError={handleError}
        style={style}
        width={styles.icon.width}
        height={styles.icon.height}
      />
    );

  return (
    <Image
      source={{ uri: iconUri }}
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

export default withSkeleton(TokenIcon, ({ size }) => (
  <CircleSkeleton radius={size} />
));
