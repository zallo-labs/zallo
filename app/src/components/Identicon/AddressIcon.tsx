import { useTheme } from '@theme/paper';
import { useMaybeToken } from '@token/useToken';
import { Address } from 'lib';
import { ImageStyle } from 'react-native';
import { StyleProp, TextStyle } from 'react-native';
import Jazzicon from 'react-native-jazzicon';
import { useAddressLabel } from '../addr/useAddrName';
import { TokenIcon } from '../token/TokenIcon/TokenIcon';
import { LabelIcon } from './LabelIcon';

export interface AddressIconProps {
  addr: Address;
  size?: number;
  style?: ImageStyle;
  labelStyle?: StyleProp<TextStyle>;
}

export const AddressIcon = ({
  addr,
  size: sizeProp,
  style,
  labelStyle,
  ...props
}: AddressIconProps) => {
  const { iconSize } = useTheme();
  const token = useMaybeToken(addr);
  const name = useAddressLabel(addr);
  const size = sizeProp ?? iconSize.medium;

  if (token) return <TokenIcon token={token} size={size} style={style} />;

  if (name)
    return <LabelIcon label={name} size={size} containerStyle={style} labelStyle={labelStyle} />;

  return <Jazzicon size={size} {...props} address={addr} containerStyle={style} />;
};
