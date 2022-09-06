import { ContactsIcon, ScanIcon } from '~/util/theme/icons';
import { FC } from 'react';
import { Appbar } from 'react-native-paper';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { AppbarHeaderProps } from '~/components/Appbar/useAppbarHeader';
import { CombinedWallet } from '~/queries/wallets';
import { useSendToContact } from '../send/useSendToContact';
import { useScanAndSend } from '../send/useScanAndSend';

export interface HomeAppbarProps {
  AppbarHeader: FC<AppbarHeaderProps>;
  wallet: CombinedWallet;
}

export const HomeAppbar = ({ AppbarHeader, wallet }: HomeAppbarProps) => {
  const scanAndSend = useScanAndSend(wallet);
  const sendToContact = useSendToContact(wallet);

  return (
    <AppbarHeader>
      <AppbarMenu />
      <Appbar.Content title="" />

      <Appbar.Action icon={ContactsIcon} onPress={sendToContact} />
      <Appbar.Action icon={ScanIcon} onPress={scanAndSend} />
    </AppbarHeader>
  );
};
