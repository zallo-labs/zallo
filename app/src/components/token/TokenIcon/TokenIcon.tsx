import { Token } from '@token/token';
import { LabelIcon } from '~/components/Identicon/LabelIcon';
import UriImage, { UriImageProps } from '~/components/UriImage';

export interface TokenIconProps extends Omit<UriImageProps, 'uri'> {
  token: Token;
}

const TokenIcon = ({
  token: { iconUri, symbol },
  ...imageProps
}: TokenIconProps) => (
  <UriImage
    uri={iconUri}
    Fallback={(props) => <LabelIcon {...props} label={symbol} />}
    {...imageProps}
  />
);

export default TokenIcon;
