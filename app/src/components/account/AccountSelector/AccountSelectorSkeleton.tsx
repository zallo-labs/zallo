import { memo } from 'react';
import { useWindowDimensions } from 'react-native';
import { Carousel } from 'react-native-snap-carousel';
import { Box } from '~/components/layout/Box';
import { Pagination } from '~/components/account/AccountSelector/Pagination/Pagination';
import { AccountCardSkeleton, ACCOUNT_CARD_STYLE } from './AccountCard/AccountCardSkeleton';

const ITEMS = 2;

export const AccountSelectorSkeleton = memo(() => {
  const window = useWindowDimensions();

  return (
    <Box>
      <Carousel
        layout="default"
        data={new Array(ITEMS).fill(0)}
        renderItem={() => <AccountCardSkeleton />}
        itemWidth={ACCOUNT_CARD_STYLE.width}
        sliderWidth={window.width}
        vertical={false}
      />

      <Box horizontal justifyContent="center" mt={3}>
        <Pagination n={ITEMS + 1} position={0} />
      </Box>
    </Box>
  );
});
