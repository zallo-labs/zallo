import { MenuIcon, ShareIcon } from '@util/theme/icons';
import { Appbar } from 'react-native-paper';

export interface ReceiveAppbarProps {}

export const ReceiveAppbar = (props: ReceiveAppbarProps) => {
  return (
    <Appbar.Header mode="center-aligned">
      <Appbar.Action icon={MenuIcon} onPress={() => alert('Unimplemented')} />

      <Appbar.Content title="Receive" />

      <Appbar.Action icon={ShareIcon} onPress={() => alert('Unimplemented')} />
    </Appbar.Header>
  );
};
