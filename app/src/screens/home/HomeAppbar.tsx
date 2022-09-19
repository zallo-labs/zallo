import { ContactsIcon, ScanIcon } from '~/util/theme/icons';
import { FC } from 'react';
import { Appbar } from 'react-native-paper';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { AppbarHeaderProps } from '~/components/Appbar/useAppbarHeader';
import { useSendToContact } from '../send/useSendToContact';
import { useSendToScanned } from '../send/useSendToScanned';
import { Address } from 'lib';
import { useUser } from '~/queries/user/useUser.api';

export interface HomeAppbarProps {
  AppbarHeader: FC<AppbarHeaderProps>;
  account: Address;
}

export const HomeAppbar = ({ AppbarHeader, account }: HomeAppbarProps) => {
  const [user] = useUser(account);
  const sendToScanned = useSendToScanned(user);
  const sendToContact = useSendToContact(user);

  return (
    <AppbarHeader>
      <AppbarMenu />
      <Appbar.Content title="" />

      <Appbar.Action icon={ContactsIcon} onPress={sendToContact} />
      <Appbar.Action icon={ScanIcon} onPress={sendToScanned} />
    </AppbarHeader>
  );
};
