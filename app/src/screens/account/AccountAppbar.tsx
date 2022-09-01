import { buildAddrLink } from '~/util/addrLink';
import { ShareIcon } from '~/util/theme/icons';
import { Address } from 'lib';
import { FC } from 'react';
import { Share } from 'react-native';
import { Appbar } from 'react-native-paper';
import { AppbarHeaderProps } from '~/components/Appbar/useAppbarHeader';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { AppbarExtraContent } from '~/components/Appbar/AppbarExtraContent';
import { InactiveIndicator } from './InactiveIndicator';

export interface AccountAppbarProps {
  AppbarHeader: FC<AppbarHeaderProps>;
  title?: string;
  account: Address;
}

export const AccountAppbar = ({
  AppbarHeader,
  title,
  account,
}: AccountAppbarProps) => {
  return (
    <AppbarHeader mode="medium">
      <Appbar.BackAction onPress={useGoBack()} />

      <AppbarExtraContent>
        <InactiveIndicator accountAddr={account} />
      </AppbarExtraContent>

      <Appbar.Content title={title || 'Account'} />

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
