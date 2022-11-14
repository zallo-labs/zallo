import { useTheme } from '@theme/paper';
import { Address } from 'lib';
import { LogBox, Platform, StyleProp, ViewStyle } from 'react-native';
import Jazzicon from 'react-native-jazzicon';
import { useAddrName } from '../addr/useAddrName';
import { LabelIcon } from './LabelIcon';

// react-native-jazzicon causes a warning; see https://github.com/stanislaw-glogowski/react-native-jazzicon/pull/1
if (Platform.OS !== 'web') LogBox.ignoreLogs(['componentWillReceiveProps has been renamed']);

export interface IdenticonProps {
  seed: Address;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const Identicon = ({ seed: addr, size: sizeProp, style, ...props }: IdenticonProps) => {
  const { iconSize } = useTheme();
  const name = useAddrName(addr);
  const size = sizeProp ?? iconSize.medium;

  if (name) return <LabelIcon label={name} size={size} style={style} />;

  return <Jazzicon size={size} {...props} address={addr} containerStyle={style} />;
};
