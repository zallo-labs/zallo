import { AddrLink } from '@features/qr/addrLink';
import { useNavigation } from '@react-navigation/native';
import { ScanIcon } from '@util/theme/icons';
import { FC, useCallback } from 'react';
import { Appbar } from 'react-native-paper';
import { AppbarMenu } from '~/components2/Appbar/AppbarMenu';
import { AppbarHeaderProps } from '~/components2/Appbar/useAppbarHeader';
import { BottomNavigatorProps } from '~/navigation/BottomNavigator';

export interface HomeAppbarProps {
  AppbarHeader: FC<AppbarHeaderProps>;
}

export const HomeAppbar = ({ AppbarHeader }: HomeAppbarProps) => {
  const { navigate } = useNavigation<BottomNavigatorProps['navigation']>();

  const onScan = useCallback((link: AddrLink) => {
    console.log({ link });
  }, []);

  return (
    <AppbarHeader>
      <AppbarMenu />
      <Appbar.Content title="" />
      <Appbar.Action
        icon={ScanIcon}
        onPress={() => navigate('Scan', { onScan })}
      />
    </AppbarHeader>
  );
};
