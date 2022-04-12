import { useState } from 'react';
import { Image } from 'react-native';
import { Avatar } from 'react-native-paper';
import { SvgUri } from 'react-native-svg';

import { Token } from '~/token/token';

const SIZE = 44;

const dimensions = {
  width: SIZE,
  height: SIZE,
};

export interface TokenIconProps {
  token: Token;
}

export const TokenIcon = ({ token: t }: TokenIconProps) => {
  const [fallback, setFallback] = useState(false);

  if (fallback) return <Avatar.Text size={SIZE} label={t.symbol.slice(0, 2)} />;

  if (t.iconUri.toLowerCase().endsWith('.svg')) return <SvgUri uri={t.iconUri} {...dimensions} />;

  return (
    <Image
      source={{ uri: t.iconUri }}
      style={dimensions}
      resizeMode="contain"
      onError={() => setFallback(true)}
    />
  );
};
