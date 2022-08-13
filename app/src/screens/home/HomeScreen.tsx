import { Box } from '@components/Box';
import { FiatValue } from '@components/FiatValue';
import { useMemo } from 'react';
import { FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelectedWallet } from '~/components2/wallet/useSelectedWallet';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { TokenCard } from '~/components2/token/TokenCard';
import {
  useSelectedToken,
  useSelectToken,
} from '~/components2/token/useSelectedToken';
import { useTokens } from '~/token/useToken';
import { useTokenValues } from '~/token/useTokenValues';
import { HomeAppbar } from './HomeAppbar';
import { WalletSelector } from './WalletSelector';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { HomeScreenSkeleton } from './HomeScreenSkeleton';

export const HomeScreen = withSkeleton(() => {
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const allTokens = useTokens();
  const wallet = useSelectedWallet();
  const { totalFiatValue } = useTokenValues(wallet?.accountAddr);
  const selectedToken = useSelectedToken();
  const selectToken = useSelectToken();

  const tokens = useMemo(
    () => [
      selectedToken,
      ...allTokens.filter((t) => t.addr !== selectedToken.addr),
    ],
    [allTokens, selectedToken],
  );

  return (
    <Box>
      <HomeAppbar AppbarHeader={AppbarHeader} />

      <FlatList
        ListHeaderComponent={
          <>
            <Box my={3}>
              <WalletSelector />
            </Box>

            <Box horizontal justifyContent="flex-end" mt={3} mb={2} mx={4}>
              <Text variant="titleLarge">
                <FiatValue value={totalFiatValue} showZero />
              </Text>
            </Box>
          </>
        }
        renderItem={({ item, index }) => (
          <Box mx={3}>
            <TokenCard
              token={item}
              amount="balance"
              price
              change
              remaining
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
