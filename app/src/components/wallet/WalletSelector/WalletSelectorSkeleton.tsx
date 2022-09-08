import { memo } from 'react';
import { useWindowDimensions } from 'react-native';
import { Carousel } from 'react-native-snap-carousel';
import { Box } from '~/components/layout/Box';
import { Pagination } from '~/components/wallet/WalletSelector/Pagination/Pagination';
import {
  WalletCardSkeleton,
  WALLET_CARD_STYLE,
} from './WalletCard/WalletPaymentCardSkeleton';

const ITEMS = 2;

export const WalletSelectorSkeleton = memo(() => {
  const window = useWindowDimensions();

  return (
    <Box>
      <Carousel
        layout="default"
        data={new Array(ITEMS).fill(0)}
        renderItem={() => <WalletCardSkeleton />}
        itemWidth={WALLET_CARD_STYLE.width}
        sliderWidth={window.width}
        vertical={false}
      />

      <Box horizontal justifyContent="center" mt={3}>
        <Pagination n={ITEMS + 1} position={0} />
      </Box>
    </Box>
  );
});
