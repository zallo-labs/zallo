import { Box } from '@components/Box';
import { RootStackScreenProps } from '@features/navigation/RootNavigation';
import { SafeQr } from '@features/safe/qr/SafeQr';
import { SafeTitle } from './SafeTitle';

export type HomeScreenProps = RootStackScreenProps<'Home'>;

export const HomeScreen = (_props: HomeScreenProps) => {
  return (
    <Box flexed vertical alignItems="center">
      <Box flex={1} center>
        <SafeTitle />
      </Box>

      <Box flex={3}>
        <SafeQr />
      </Box>
    </Box>
  );
};
