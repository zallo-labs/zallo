import { useTheme } from '@theme/paper';
import { Address } from 'lib';
import { LogBox, Platform, StyleProp, ViewStyle } from 'react-native';
import Jazzicon from 'react-native-jazzicon';
import { useContact } from '~/queries/contacts/useContact';
import { LabelIcon } from './LabelIcon';

// react-native-jazzicon causes a warning; see https://github.com/stanislaw-glogowski/react-native-jazzicon/pull/1
if (Platform.OS !== 'web')
  LogBox.ignoreLogs(['componentWillReceiveProps has been renamed']);

export interface IdenticonProps {
  seed: Address;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const Identicon = ({
  seed: addr,
  size: sizeProp,
  style,
  ...props
}: IdenticonProps) => {
  const { iconSize } = useTheme();
  const contact = useContact(addr);
  const size = sizeProp ?? iconSize.medium;

  // const seed = useMemo(() => {
  //   return parseInt(addr.slice(2, 10), 16);
  // }, [addr]);

  if (contact)
    return <LabelIcon label={contact.name} size={size} style={style} />;

  return <Jazzicon size={size} {...props} address={addr} />;
};
