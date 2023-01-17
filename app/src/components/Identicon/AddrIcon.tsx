import { useTheme } from '@theme/paper';
import { useMaybeToken } from '@token/useToken';
import { Address } from 'lib';
import { ImageStyle, LogBox, Platform, StyleProp, TextStyle } from 'react-native';
import Jazzicon from 'react-native-jazzicon';
import { useAddrName } from '../addr/useAddrName';
import TokenIcon from '../token/TokenIcon/TokenIcon';
import { LabelIcon } from './LabelIcon';

// react-native-jazzicon causes a warning; see https://github.com/stanislaw-glogowski/react-native-jazzicon/pull/1
if (Platform.OS !== 'web') LogBox.ignoreLogs(['componentWillReceiveProps has been renamed']);

export interface AddrIconProps {
  addr: Address;
  size?: number;
  style?: StyleProp<ImageStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export const AddrIcon = ({ addr, size: sizeProp, style, labelStyle, ...props }: AddrIconProps) => {
  const { iconSize } = useTheme();
  const token = useMaybeToken(addr);
  const name = useAddrName(addr);
  const size = sizeProp ?? iconSize.medium;

  if (token) return <TokenIcon token={token} size={size} style={style} />;

  if (name) return <LabelIcon label={name} size={size} style={style} labelStyle={labelStyle} />;

  return <Jazzicon size={size} {...props} address={addr} containerStyle={style} />;
};
