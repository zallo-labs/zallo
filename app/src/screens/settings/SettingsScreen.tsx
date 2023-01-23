import { Appbar } from 'react-native-paper';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { Box } from '~/components/layout/Box';

export const SettingsScreen = () => {
  return (
    <Box flex={1}>
      <Appbar.Header>
        <AppbarMenu />
      </Appbar.Header>
    </Box>
  );
};
