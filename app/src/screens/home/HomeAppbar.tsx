import { ContactsIcon, ScanIcon } from '~/util/theme/icons';
import { FC } from 'react';
import { Appbar } from 'react-native-paper';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { AppbarHeaderProps } from '~/components/Appbar/useAppbarHeader';
import { useNavigation } from '@react-navigation/native';
import { useSelectContact } from '../contacts/useSelectContact';
import { useScanAddr } from '../scan/useScanAddr';
import { AccountId } from '@api/account';

export interface HomeAppbarProps {
  AppbarHeader: FC<AppbarHeaderProps>;
  account: AccountId;
}

export const HomeAppbar = ({ AppbarHeader, account }: HomeAppbarProps) => {
  const { navigate } = useNavigation();
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
            account,
          })
        }
      />
      <Appbar.Action
        icon={ScanIcon}
        onPress={async () =>
          navigate('Send', {
            to: (await scanAddr()).target_address,
            account,
          })
        }
      />
    </AppbarHeader>
  );
};
