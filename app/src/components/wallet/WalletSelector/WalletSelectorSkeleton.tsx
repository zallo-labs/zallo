import { Box } from '~/components/layout/Box';
import { Pagination } from '~/components/wallet/WalletSelector/Pagination/Pagination';
import { WalletCardSkeleton } from './WalletCard/WalletPaymentCardSkeleton';

export const WalletSelectorSkeleton = () => (
  <Box mx={4}>
    <Box horizontal justifyContent="center" my={3}>
      <WalletCardSkeleton />
    </Box>

    <Box horizontal justifyContent="center" mt={3}>
      <Pagination n={3} position={0} />
    </Box>
  </Box>
);
