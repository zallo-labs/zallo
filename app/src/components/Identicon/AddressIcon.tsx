import { ImageStyle, StyleProp, TextStyle } from 'react-native';

import { Address, asAddress, UAddress } from 'lib';
import { ICON_SIZE } from '~/util/theme/paper';
import { CircleSkeleton } from '../skeleton/CircleSkeleton';
import { withSuspense } from '../skeleton/withSuspense';
import { Blockie } from './Blockie';

export interface AddressIconProps {
  address: Address | UAddress;
  size?: number;
  style?: ImageStyle;
  labelStyle?: StyleProp<TextStyle>;
}

function AddressIcon_({
  address,
  size = ICON_SIZE.medium,
  style,
  labelStyle,
  ...props
}: AddressIconProps) {
  // const name = useAddressLabel(address);

  // if (name)
  //   return <LabelIcon label={name} size={size} containerStyle={style} labelStyle={labelStyle} />;

  // return <Jazzicon size={size} {...props} address={address} containerStyle={style} />;

  return <Blockie seed={asAddress(address)} size={size} style={style} />;
}

export const AddressIcon = withSuspense(AddressIcon_, ({ size = ICON_SIZE.medium }) => (
  <CircleSkeleton size={size} />
));
