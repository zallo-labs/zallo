import { MenuIcon, ShareIcon } from '@util/theme/icons';
import { useCallback } from 'react';
import { Share } from 'react-native';
import { Appbar } from 'react-native-paper';

export interface ReceiveAppbarProps {
  url: string;
}

export const ReceiveAppbar = ({ url }: ReceiveAppbarProps) => {
  const share = useCallback(() => Share.share({ url, message: url }), [url]);

  return (
    <Appbar.Header mode="center-aligned">
      <Appbar.Action icon={MenuIcon} onPress={() => alert('Unimplemented')} />

      <Appbar.Content title="Receive" />

      <Appbar.Action icon={ShareIcon} onPress={share} />
    </Appbar.Header>
  );
};
