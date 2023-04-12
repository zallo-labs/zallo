import { ICON_SIZE } from '@theme/paper';
import { useMaybeToken } from '@token/useToken';
import { Address } from 'lib';
import { ImageStyle } from 'react-native';
import { StyleProp, TextStyle } from 'react-native';
import Jazzicon from 'react-native-jazzicon';
import { useAddressLabel } from '../address/AddressLabel';
import { TokenIcon } from '../token/TokenIcon/TokenIcon';
import { LabelIcon } from './LabelIcon';
import { withSuspense } from '../skeleton/withSuspense';
import { CircleSkeleton } from '../skeleton/CircleSkeleton';
import { Blockie } from './Blockie';

export interface AddressIconProps {
  address: Address;
  size?: number;
  style?: ImageStyle;
  labelStyle?: StyleProp<TextStyle>;
}

export const AddressIcon = withSuspense(
  ({ address, size = ICON_SIZE.medium, style, labelStyle, ...props }: AddressIconProps) => {
    const token = useMaybeToken(address);
    const name = useAddressLabel(address);

    if (token) return <TokenIcon token={token} size={size} style={style} />;

    // return <Blockie seed={address} size={size} style={style} />;

    if (name)
      return <LabelIcon label={name} size={size} containerStyle={style} labelStyle={labelStyle} />;

    return <Jazzicon size={size} {...props} address={address} containerStyle={style} />;
  },
  ({ size = ICON_SIZE.medium }) => <CircleSkeleton size={size} />,
);
