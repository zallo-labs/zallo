import { Box } from '~/components/layout/Box';
import { ReceiveAppbar } from './ReceiveAppbar';
import { buildAddressLink } from '~/util/addressLink';
import { useMemo, useState } from 'react';
import { SelectableTokenAmountCard } from '~/components/token/SelectableTokenAmountCard';
import { useSelectedToken } from '~/components/token/useSelectedToken';
import { Button } from 'react-native-paper';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { useKeepAwakeWhenFocussed } from '~/util/hook/useKeepAwakeWhenFocussed';
import { AccountSelector } from '../../components/account/AccountSelector/AccountSelector';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { Container } from '~/components/layout/Container';
import { QrCode } from './QrCode';
import { FaucetButton } from './FaucetButton';
import { useSelectedAccountId } from '~/components/AccountSelector/useSelectedAccount';

export const ReceiveScreen = withSuspense(
  () => {
    const navigation = useRootNavigation();
    useKeepAwakeWhenFocussed();

    const [account, setAccount] = useState(useSelectedAccountId());

    const token = useSelectedToken();
    const [amount, setAmount] = useState<bigint | undefined>();

    const url = useMemo(
      () =>
        buildAddressLink({
          target_address: account,
          ...(amount && { token, amount }),
        }),
      [account, amount, token],
    );

    return (
      <Box flex={1}>
        <ReceiveAppbar account={account} url={url} />

        <Box flex={1} justifyContent="space-around">
          <Box horizontal justifyContent="center">
            <QrCode value={url} />
          </Box>

          <Container separator={<Box my={1} />} mb={3}>
            <Box mx={4}>
              {amount ? (
                <SelectableTokenAmountCard amount={amount} onChange={setAmount} />
              ) : (
                <Box
                  display="flex"
                  flexDirection="row-reverse"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  {!amount && (
                    <Button
                      icon="plus"
                      onPress={() => navigation.navigate('Amount', { onChange: setAmount })}
                    >
                      Amount
                    </Button>
                  )}

                  <FaucetButton account={account} />
                </Box>
              )}
            </Box>

            <AccountSelector selected={account} onSelect={setAccount} />
          </Container>
        </Box>
      </Box>
    );
  },
  () => <ScreenSkeleton menu mode="center-aligned" />,
);
