import { useState } from 'react';
import { Image } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { PRIMARY_ICON_SIZE } from '../list/Item';
import { LabelIcon } from '@components/LabelIcon';

import { Token } from '~/token/token';

const dimensions = {
  width: PRIMARY_ICON_SIZE,
  height: PRIMARY_ICON_SIZE,
};

export interface TokenIconProps {
  token: Token;
}

export const TokenIcon = ({ token: t }: TokenIconProps) => {
  const [fallback, setFallback] = useState(false);

  if (fallback) return <LabelIcon label={t.symbol} />;

  if (t.iconUri.toLowerCase().endsWith('.svg'))
    return <SvgUri uri={t.iconUri} {...dimensions} />;

  return (
    <Image
      source={{ uri: t.iconUri }}
      style={dimensions}
      resizeMode="contain"
      onError={() => setFallback(true)}
    />
  );
};
