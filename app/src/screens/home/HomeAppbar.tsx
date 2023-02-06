import { ContactsIcon, ScanIcon } from '~/util/theme/icons';
import { FC } from 'react';
import { Appbar } from 'react-native-paper';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { AppbarHeaderProps } from '~/components/Appbar/useAppbarHeader';
import { Address } from 'lib';
import { useSelectQuorum } from '../account/quorums/useSelectQuorum';
import { useNavigation } from '@react-navigation/native';
import { useSelectContact } from '../contacts/useSelectContact';
import { useScanAddr } from '../scan/useScanAddr';

export interface HomeAppbarProps {
  AppbarHeader: FC<AppbarHeaderProps>;
  account: Address;
}

export const HomeAppbar = ({ AppbarHeader, account }: HomeAppbarProps) => {
  const { navigate } = useNavigation();
  const selectQuorum = useSelectQuorum(account);
  const selectContact = useSelectContact();
  const scanAddr = useScanAddr();

  return (
    <AppbarHeader>
      <AppbarMenu />
      <Appbar.Content title="" />

      <Appbar.Action
        icon={ContactsIcon}
        onPress={async () =>
          navigate('Send', {
            to: (await selectContact()).addr,
            quorum: await selectQuorum(),
          })
        }
      />
      <Appbar.Action
        icon={ScanIcon}
        onPress={async () =>
          navigate('Send', {
            to: (await scanAddr()).target_address,
            quorum: await selectQuorum(),
          })
        }
      />
    </AppbarHeader>
  );
};
