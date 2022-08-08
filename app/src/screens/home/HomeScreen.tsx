import { Box } from '@components/Box';
import { ScanIcon } from '@util/theme/icons';
import { Appbar } from 'react-native-paper';
import { AppbarMenu } from '~/components2/Appbar/AppbarMenu';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { WalletSelector } from './WalletSelector';

export const HomeScreen = () => {
  const { AppbarHeader, handleScroll } = useAppbarHeader();

  return (
    <Box flex={1}>
      <AppbarHeader>
        <AppbarMenu />
        <Appbar.Content title="" />
        <Appbar.Action icon={ScanIcon} />
      </AppbarHeader>

      <Box my={3}>
        <WalletSelector />
      </Box>
    </Box>
  );
};
