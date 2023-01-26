import { Tokenlike, useToken } from '@token/useToken';
import { LabelIcon } from '~/components/Identicon/LabelIcon';
import { Image, ImageProps } from '~/components/Image';

export interface TokenIconProps extends Omit<ImageProps, 'source'> {
  token: Tokenlike;
}

const TokenIcon = ({ token: tokenlike, ...imageProps }: TokenIconProps) => {
  const { iconUri, symbol } = useToken(tokenlike);

  return (
    <Image
      source={iconUri}
      fallback={(props) => <LabelIcon {...props} label={symbol} />}
      {...imageProps}
    />
  );
};

export default TokenIcon;
