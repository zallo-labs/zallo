import { Box } from '@components/Box';
import { makeStyles } from '@util/theme/makeStyles';
import { toId } from 'lib';
import { useCallback, useMemo, useState } from 'react';
import {
  LazyPagerView,
  PagerViewOnPageSelectedEvent,
} from 'react-native-pager-view';
import {
  useSelectWallet,
  useSelectedWallet,
} from '~/components2/wallet/useSelectedWallet';
import { Indicator } from '~/components2/Indicator/Indicator';
import { WalletCard, WALLET_CARD_HEIGHT } from '~/components2/WalletCard';
import { useWallets } from '~/queries/wallets/useWallets';

export const WalletSelector = () => {
  const { wallets: wallets } = useWallets();
  const styles = useStyles();
  const selected = useSelectedWallet();
  const select = useSelectWallet();

  const [position, setPosition] = useState(() =>
    wallets.findIndex((w) => w.id === selected.id),
  );

  const handlePageSelected = useCallback(
    ({ nativeEvent: { position: newPos } }: PagerViewOnPageSelectedEvent) => {
      setPosition(newPos);
      select(wallets[newPos]);
    },
    [select, wallets],
  );

  return (
    <Box>
      <LazyPagerView
        renderItem={({ item, index }) => (
          <Box key={index + 1} mx={5}>
            <WalletCard wallet={item} available />
          </Box>
        )}
        style={styles.viewPager}
        data={wallets}
        keyExtractor={(item) => item.id}
        initialPage={position}
        onPageSelected={handlePageSelected}
      />

      <Box horizontal justifyContent="center" mt={3}>
        <Indicator n={wallets.length} position={position} />
      </Box>
    </Box>
  );
};

const useStyles = makeStyles(() => ({
  viewPager: {
    height: WALLET_CARD_HEIGHT,
  },
}));
