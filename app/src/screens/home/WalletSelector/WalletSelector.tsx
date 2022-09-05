import { Box } from '~/components/layout/Box';
import { useState } from 'react';
import { Indicator } from '~/screens/home/WalletSelector/Indicator/Indicator';
import {
  WalletPaymentCard,
  WalletPaymentCardProps,
} from '~/screens/home/WalletSelector/WalletPaymentCard/WalletPaymentCard';
import { useWalletIds } from '~/queries/wallets/useWalletIds';
import { NewWalletPaymentCard } from '~/screens/home/WalletSelector/WalletPaymentCard/NewWalletPaymentCard';
import { useCreateWallet } from '~/mutations/wallet/useCreateWallet';
import { CombinedWallet, WalletId } from '~/queries/wallets';
import { WALLET_PAYMENT_CARD_STYLE } from './WalletPaymentCard/WalletPaymentCardSkeleton';
import Carousel from 'react-native-snap-carousel';
import { useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

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
  const createWallet = useCreateWallet();
  const window = useWindowDimensions();

  const [position, setPosition] = useState(() => {
    const i = walletIds.findIndex((w) => w.id === selected.id);
    return i >= 0 ? i : 0;
  });

  return (
    <Box>
      <Carousel
        layout="default"
        data={[...walletIds, null]}
        renderItem={({ item }) =>
          item !== null ? (
            <WalletPaymentCard id={item} {...cardProps} />
          ) : (
            <NewWalletPaymentCard onPress={createWallet} />
          )
        }
        itemWidth={WALLET_PAYMENT_CARD_STYLE.width}
        sliderWidth={window.width}
        vertical={false}
        onScrollIndexChanged={(index) => {
          setPosition(index);
          const item = walletIds[index];
          if (selected !== item) {
            onSelect(item);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
      />

      <Box horizontal justifyContent="center" mt={3}>
        <Indicator n={walletIds.length + 1} position={position} />
      </Box>
    </Box>
  );
};
