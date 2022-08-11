import { Box } from '@components/Box';
import { makeStyles } from '@util/theme/makeStyles';
import { useCallback, useState } from 'react';
import PagerView, {
  PagerViewOnPageSelectedEvent,
} from 'react-native-pager-view';
import {
  useSelectWallet,
  useSelectedWallet,
} from '~/components2/wallet/useSelectedWallet';
import { Indicator } from '~/components2/Indicator/Indicator';
import { WalletPaymentCard } from '~/components2/wallet/payment/WalletPaymentCard';
import { useWalletIds } from '~/queries/wallets/useWalletIds';
import { NewWalletPaymentCard } from '~/components2/wallet/payment/NewWalletPaymentCard';
import { WALLET_PAYMENT_CARD_HEIGHT } from '~/components2/wallet/payment/WalletPaymentCardSkeleton';

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
      if (newPos < walletIds.length) select(walletIds[newPos]);
    },
    [select, walletIds],
  );

  return (
    <Box>
      <PagerView
        style={styles.viewPager}
        initialPage={position}
        onPageSelected={handlePageSelected}
      >
        {walletIds.map((id, i) => (
          <Box key={i + 1} mx={4}>
            <WalletPaymentCard id={id} available />
          </Box>
        ))}

        <Box key={walletIds.length + 1} mx={4}>
          <NewWalletPaymentCard
            onPress={() => {
              // TODO: add wallet
            }}
          />
        </Box>
      </PagerView>

      <Box horizontal justifyContent="center" mt={3}>
        <Indicator n={walletIds.length + 1} position={position} />
      </Box>
    </Box>
  );
};

const useStyles = makeStyles({
  viewPager: {
    height: WALLET_PAYMENT_CARD_HEIGHT,
  },
});
