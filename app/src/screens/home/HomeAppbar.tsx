import { AddrLink } from '~/util/addrLink';
import { ContactsIcon, ScanIcon } from '~/util/theme/icons';
import { FC, useCallback } from 'react';
import { Appbar } from 'react-native-paper';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { AppbarHeaderProps } from '~/components/Appbar/useAppbarHeader';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { CombinedWallet } from '~/queries/wallets';
import { useSendToContact } from './useSendToContact';

export interface HomeAppbarProps {
  AppbarHeader: FC<AppbarHeaderProps>;
  wallet: CombinedWallet;
}

export const HomeAppbar = ({ AppbarHeader, wallet }: HomeAppbarProps) => {
  const { navigate } = useRootNavigation();
  const sendToContact = useSendToContact(wallet);

  const onScan = useCallback((link: AddrLink) => {
    console.log({ link });
  }, []);

  return (
    <AppbarHeader>
      <AppbarMenu />
      <Appbar.Content title="" />

      <Appbar.Action icon={ContactsIcon} onPress={sendToContact} />

      <Appbar.Action
        icon={ScanIcon}
        onPress={() => navigate('Scan', { onScan })}
      />
    </AppbarHeader>
  );
};
