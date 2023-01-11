import { PeopleIcon, ScanIcon } from '~/util/theme/icons';
import { FC } from 'react';
import { Appbar } from 'react-native-paper';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { AppbarHeaderProps } from '~/components/Appbar/useAppbarHeader';
import { useSendToContact } from '../send/useSendToContact';
import { useSendToScanned } from '../send/useSendToScanned';
import { Address } from 'lib';
import { useSelectQuorum } from '../account/quorums/useSelectQuorum';

export interface HomeAppbarProps {
  AppbarHeader: FC<AppbarHeaderProps>;
  account: Address;
}

export const HomeAppbar = ({ AppbarHeader, account }: HomeAppbarProps) => {
  const selectQuorum = useSelectQuorum(account);
  const sendToScanned = useSendToScanned();
  const sendToContact = useSendToContact();

  return (
    <AppbarHeader>
      <AppbarMenu />
      <Appbar.Content title="" />

      <Appbar.Action icon={PeopleIcon} onPress={() => selectQuorum(sendToContact)} />
      <Appbar.Action icon={ScanIcon} onPress={() => selectQuorum(sendToScanned)} />
    </AppbarHeader>
  );
};
