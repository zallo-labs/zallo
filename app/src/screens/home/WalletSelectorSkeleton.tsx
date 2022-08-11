import { Box } from '@components/Box';
import { Indicator } from '~/components2/Indicator/Indicator';
import { WalletPaymentCardSkeleton } from '~/components2/wallet/payment/WalletPaymentCardSkeleton';

export const WalletSelectorSkeleton = () => (
  <Box mx={4}>
    <Box my={3}>
      <WalletPaymentCardSkeleton />
    </Box>

    <Box horizontal justifyContent="center" mt={3}>
      <Indicator n={3} position={0} />
    </Box>
  </Box>
);
