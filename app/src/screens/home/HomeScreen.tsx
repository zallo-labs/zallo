import { Box } from '~/components/layout/Box';
import { useMemo } from 'react';
import { FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import {
  useSelectedWalletId,
  useSelectWallet,
} from '~/components/wallet/useSelectedWallet';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import {
  useSelectedToken,
  useSelectToken,
} from '~/components/token/useSelectedToken';
import { HomeAppbar } from './HomeAppbar';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { HomeScreenSkeleton } from './HomeScreenSkeleton';
import { FiatBalance } from '~/components/fiat/FiatBalance';
import { Suspend } from '~/components/Suspender';
import { TokenHoldingCard } from '~/components/token/TokenHoldingCard';
import { WalletPaymentSelector } from './WalletPaymentSelector';
import { useTokensByValue } from '@token/useTokensByValue';
import { useWallet } from '~/queries/wallet/useWallet';

export const HomeScreen = withSkeleton(() => {
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const [selectedToken, selectToken] = [useSelectedToken(), useSelectToken()];
  const [wallet, selectWallet] = [
    useWallet(useSelectedWalletId()),
    useSelectWallet(),
  ];
  const allTokens = useTokensByValue(wallet?.accountAddr);

  const tokens = useMemo(
    () => [
      selectedToken,
      ...allTokens.filter((t) => t.addr !== selectedToken.addr),
    ],
    [allTokens, selectedToken],
  );

  if (!wallet) return <Suspend />;

  return (
    <Box>
      <HomeAppbar AppbarHeader={AppbarHeader} wallet={wallet} />

      <FlatList
        ListHeaderComponent={
          <>
            <WalletPaymentSelector
              selected={wallet}
              onSelect={selectWallet}
              cardProps={{ available: true }}
            />

            <Box horizontal justifyContent="flex-end" mt={3} mb={2} mx={4}>
              <Text variant="titleLarge">
                <FiatBalance addr={wallet.accountAddr} showZero />
              </Text>
            </Box>
          </>
        }
        renderItem={({ item, index }) => (
          <Box mx={3}>
            <TokenHoldingCard
              token={item}
              wallet={wallet}
              selected={index === 0}
              onLongPress={() => selectToken(item)}
              onPress={() => {
                // onPress is required to be set for onLongPress to work in RNP
                // https://github.com/callstack/react-native-paper/issues/3303
              }}
            />
          </Box>
        )}
        ItemSeparatorComponent={() => <Box my={2} />}
        data={tokens}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
}, HomeScreenSkeleton);
