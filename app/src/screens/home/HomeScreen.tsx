import { Box } from '~/components/layout/Box';
import { useMemo } from 'react';
import { FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import {
  useSelectAccount,
  useSelectedAccount,
} from '~/screens/home/useSelectedAccount';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import {
  useSelectedToken,
  useSelectToken,
} from '~/components/token/useSelectedToken';
import { HomeAppbar } from './HomeAppbar';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { HomeScreenSkeleton } from './HomeScreenSkeleton';
import { FiatBalance } from '~/components/fiat/FiatBalance';
import { TokenHoldingCard } from '~/components/token/TokenHoldingCard';
import { AccountPaymentSelector } from './AccountPaymentSelector';
import { useTokensByValue } from '@token/useTokensByValue';
import { useUser } from '~/queries/user/useUser.api';

export const HomeScreen = withSkeleton(() => {
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const [selectedToken, selectToken] = [useSelectedToken(), useSelectToken()];
  const [account, selectAccount] = [useSelectedAccount(), useSelectAccount()];
  const [user] = useUser(account);
  const allTokens = useTokensByValue(account);

  const tokens = useMemo(
    () => [
      selectedToken,
      ...allTokens.filter((t) => t.addr !== selectedToken.addr),
    ],
    [allTokens, selectedToken],
  );

  return (
    <Box>
      <HomeAppbar AppbarHeader={AppbarHeader} account={account} />

      <FlatList
        ListHeaderComponent={
          <>
            <AccountPaymentSelector
              selected={account}
              onSelect={selectAccount}
              cardProps={{ available: true }}
            />

            <Box horizontal justifyContent="flex-end" mt={3} mb={2} mx={4}>
              <Text variant="titleLarge">
                <FiatBalance addr={account} showZero />
              </Text>
            </Box>
          </>
        }
        renderItem={({ item, index }) => (
          <Box mx={3}>
            <TokenHoldingCard
              token={item}
              user={user}
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
