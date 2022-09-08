import { Box } from '~/components/layout/Box';
import { useState } from 'react';
import { Pagination } from '~/components/wallet/WalletSelector/Pagination/Pagination';
import {
  WalletCard,
  WalletCardProps,
} from '~/components/wallet/WalletSelector/WalletCard/WalletCard';
import { useWalletIds } from '~/queries/wallets/useWalletIds';
import { NewWalletCard } from '~/components/wallet/WalletSelector/WalletCard/NewWalletCard';
import { useCreateWallet } from '~/mutations/wallet/useCreateWallet';
import { CombinedWallet, WalletId } from '~/queries/wallets';
import { WALLET_CARD_STYLE } from './WalletCard/WalletPaymentCardSkeleton';
import Carousel from 'react-native-snap-carousel';
import { useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface WalletSelectorProps {
  selected: CombinedWallet;
  onSelect: (wallet: WalletId) => void;
  cardProps?: Partial<WalletCardProps>;
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
            <WalletCard id={item} {...cardProps} />
          ) : (
            <NewWalletCard onPress={createWallet} />
          )
        }
        itemWidth={WALLET_CARD_STYLE.width}
        sliderWidth={window.width}
        vertical={false}
        firstItem={position}
        onScrollIndexChanged={(index) => {
          setPosition(index);
          const item: WalletId | undefined = walletIds[index];
          if (item && item !== selected) {
            onSelect(item);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
      />

      <Box horizontal justifyContent="center" mt={3}>
        <Pagination n={walletIds.length + 1} position={position} />
      </Box>
    </Box>
  );
};
