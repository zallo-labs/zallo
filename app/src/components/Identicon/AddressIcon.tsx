import { ICON_SIZE } from '@theme/paper';
import { Address } from 'lib';
import { ImageStyle } from 'react-native';
import { StyleProp, TextStyle } from 'react-native';
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
    // const name = useAddressLabel(address);

    // if (name)
    //   return <LabelIcon label={name} size={size} containerStyle={style} labelStyle={labelStyle} />;

    // return <Jazzicon size={size} {...props} address={address} containerStyle={style} />;

    return <Blockie seed={address} size={size} style={style} />;
  },
  ({ size = ICON_SIZE.medium }) => <CircleSkeleton size={size} />,
);
