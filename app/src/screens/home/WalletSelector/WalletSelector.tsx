import { Box } from '~/components/layout/Box';
import { makeStyles } from '~/util/theme/makeStyles';
import { useCallback, useState } from 'react';
import PagerView, {
  PagerViewOnPageSelectedEvent,
} from 'react-native-pager-view';
import { Indicator } from '~/screens/home/WalletSelector/Indicator/Indicator';
import {
  WalletPaymentCard,
  WalletPaymentCardProps,
} from '~/screens/home/WalletSelector/WalletPaymentCard/WalletPaymentCard';
import { useWalletIds } from '~/queries/wallets/useWalletIds';
import { NewWalletPaymentCard } from '~/screens/home/WalletSelector/WalletPaymentCard/NewWalletPaymentCard';
import { useCreateWallet } from '~/mutations/wallet/useCreateWallet';
import { Suspend } from '~/components/Suspender';
import { CombinedWallet, WalletId } from '~/queries/wallets';
import { WALLET_PAYMENT_CARD_STYLE } from './WalletPaymentCard/WalletPaymentCardSkeleton';

export interface WalletSelectorProps {
  selected: CombinedWallet;
  onSelect: (wallet: WalletId) => void;
  cardProps?: Partial<WalletPaymentCardProps>;
}

export const WalletSelector = ({
  selected,
  onSelect,
  cardProps,
}: WalletSelectorProps) => {
  const { walletIds } = useWalletIds();
  const styles = useStyles();
  const createWallet = useCreateWallet();

  const [position, setPosition] = useState(() => {
    const i = walletIds.findIndex((w) => w.id === selected.id);
    return i >= 0 ? i : 0;
  });

  const handlePageSelected = useCallback(
    ({ nativeEvent: { position: newPos } }: PagerViewOnPageSelectedEvent) => {
      setPosition(newPos);
      if (newPos < walletIds.length) onSelect(walletIds[newPos]);
    },
    [onSelect, walletIds],
  );

  if (!selected) return <Suspend />;

  return (
    <Box>
      <PagerView
        style={styles.viewPager}
        initialPage={position}
        onPageSelected={handlePageSelected}
      >
        {walletIds.map((id, i) => (
          <Box key={i + 1} horizontal justifyContent="center">
            <WalletPaymentCard id={id} {...cardProps} />
          </Box>
        ))}

        <Box key={walletIds.length + 1} horizontal justifyContent="center">
          <NewWalletPaymentCard onPress={createWallet} />
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
    height: WALLET_PAYMENT_CARD_STYLE.height,
  },
});
