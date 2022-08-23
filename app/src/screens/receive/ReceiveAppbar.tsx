import { ShareIcon } from '~/util/theme/icons';
import { useCallback } from 'react';
import { Share } from 'react-native';
import { Appbar } from 'react-native-paper';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';

export interface ReceiveAppbarProps {
  url: string;
}

export const ReceiveAppbar = ({ url }: ReceiveAppbarProps) => {
  const share = useCallback(() => Share.share({ url, message: url }), [url]);

  return (
    <Appbar.Header mode="center-aligned">
      <AppbarMenu />

      <Appbar.Content title="Receive" />

      <Appbar.Action icon={ShareIcon} onPress={share} />
    </Appbar.Header>
  );
};
