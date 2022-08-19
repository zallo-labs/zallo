import { buildAddrLink } from '@features/qr/addrLink';
import { ShareIcon } from '@util/theme/icons';
import { Address } from 'lib';
import { FC } from 'react';
import { Share } from 'react-native';
import { Appbar } from 'react-native-paper';
import { AppbarHeaderProps } from '~/components2/Appbar/useAppbarHeader';
import { useGoBack } from '~/components2/Appbar/useGoBack';

export interface AccountAppbarProps {
  AppbarHeader: FC<AppbarHeaderProps>;
  account: Address;
}

export const AccountAppbar = ({
  AppbarHeader,
  account,
}: AccountAppbarProps) => {
  return (
    <AppbarHeader mode="medium">
      <Appbar.BackAction onPress={useGoBack()} />
      <Appbar.Content title="Account" />
      <Appbar.Action
        icon={ShareIcon}
        onPress={() => {
          const url = buildAddrLink({ target_address: account });
          Share.share({ url, message: url });
        }}
      />
    </AppbarHeader>
  );
};
