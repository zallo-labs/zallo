import { Box } from '@components/Box';
import { FiatValue } from '@components/FiatValue';
import { ScanIcon } from '@util/theme/icons';
import { FlatList } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useSelectedAccount } from '~/components2/account/useSelectedAccount';
import { AppbarMenu } from '~/components2/Appbar/AppbarMenu';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { TokenCard } from '~/components2/token/TokenCard';
import { useTokens } from '~/token/useToken';
import { useTokenValues } from '~/token/useTokenValues';
import { WalletSelector } from './WalletSelector';

export const HomeScreen = () => {
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const tokens = useTokens();
  const wallet = useSelectedAccount();
  const { totalFiatValue } = useTokenValues(wallet.safeAddr);

  return (
    <Box>
      <AppbarHeader>
        <AppbarMenu />
        <Appbar.Content title="" />
        <Appbar.Action icon={ScanIcon} />
      </AppbarHeader>

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
        renderItem={({ item }) => (
          <Box mx={4}>
            <TokenCard token={item} amount="balance" price change remaining />
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
