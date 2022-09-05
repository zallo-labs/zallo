import { Box } from '~/components/layout/Box';
import { Indicator } from '~/screens/home/WalletSelector/Indicator/Indicator';
import { WalletPaymentCardSkeleton } from './WalletPaymentCard/WalletPaymentCardSkeleton';

export const WalletSelectorSkeleton = () => (
  <Box mx={4}>
    <Box horizontal justifyContent="center" my={3}>
      <WalletPaymentCardSkeleton />
    </Box>

    <Box horizontal justifyContent="center" mt={3}>
      <Indicator n={3} position={0} />
    </Box>
  </Box>
);
