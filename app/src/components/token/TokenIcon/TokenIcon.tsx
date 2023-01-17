import { Tokenlike, useToken } from '@token/useToken';
import { LabelIcon } from '~/components/Identicon/LabelIcon';
import UriImage, { UriImageProps } from '~/components/UriImage';

export interface TokenIconProps extends Omit<UriImageProps, 'uri'> {
  token: Tokenlike;
}

const TokenIcon = ({ token: tokenlike, ...imageProps }: TokenIconProps) => {
  const { iconUri, symbol } = useToken(tokenlike);

  return (
    <UriImage
      uri={iconUri}
      Fallback={(props) => <LabelIcon {...props} label={symbol} />}
      {...imageProps}
    />
  );
};

export default TokenIcon;
