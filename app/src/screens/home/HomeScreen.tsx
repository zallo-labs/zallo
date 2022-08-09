import { Box } from '@components/Box';
import { FiatValue } from '@components/FiatValue';
import { useMemo } from 'react';
import { FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelectedAccount } from '~/components2/account/useSelectedAccount';
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
import { sortBy } from 'lodash';

export const HomeScreen = () => {
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const allTokens = useTokens();
  const wallet = useSelectedAccount();
  const { totalFiatValue } = useTokenValues(wallet.safeAddr);
  const selectedToken = useSelectedToken();
  const selectToken = useSelectToken();

  const tokens = useMemo(
    () => sortBy(allTokens, (t) => t.addr === selectedToken.addr),
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
                <FiatValue value={totalFiatValue} />
              </Text>
            </Box>
          </>
        }
        renderItem={({ item, index }) => (
          <Box mx={4}>
            <TokenCard
              token={item}
              amount="balance"
              price
              change
              remaining
              selected={index === 0}
              onPress={() => selectToken(item)}
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
};
