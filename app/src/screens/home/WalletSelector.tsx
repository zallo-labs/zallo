import { Box } from '@components/Box';
import { makeStyles } from '@util/theme/makeStyles';
import { useCallback, useState } from 'react';
import {
  LazyPagerView,
  PagerViewOnPageSelectedEvent,
} from 'react-native-pager-view';
import {
  useSelectWallet,
  useSelectedWallet,
} from '~/components2/wallet/useSelectedWallet';
import { Indicator } from '~/components2/Indicator/Indicator';
import { WalletCard, WALLET_CARD_HEIGHT } from '~/components2/wallet/WalletCard';
import { useWalletIds } from '~/queries/wallets/useWalletIds';

export const WalletSelector = () => {
  const { walletIds } = useWalletIds();
  const styles = useStyles();
  const selected = useSelectedWallet();
  const select = useSelectWallet();

  const [position, setPosition] = useState(() =>
    walletIds.findIndex((w) => w.id === selected.id),
  );

  const handlePageSelected = useCallback(
    ({ nativeEvent: { position: newPos } }: PagerViewOnPageSelectedEvent) => {
      setPosition(newPos);
      select(walletIds[newPos]);
    },
    [select, walletIds],
  );

  return (
    <Box>
      <LazyPagerView
        renderItem={({ item, index }) => (
          <Box key={index + 1} mx={5}>
            <WalletCard id={item} available />
          </Box>
        )}
        style={styles.viewPager}
        data={walletIds}
        keyExtractor={(item) => item.id}
        initialPage={position}
        onPageSelected={handlePageSelected}
      />

      <Box horizontal justifyContent="center" mt={3}>
        <Indicator n={walletIds.length} position={position} />
      </Box>
    </Box>
  );
};

const useStyles = makeStyles(() => ({
  viewPager: {
    height: WALLET_CARD_HEIGHT,
  },
}));
