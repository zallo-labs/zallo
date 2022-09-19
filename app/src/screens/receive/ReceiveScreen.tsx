import { Box } from '~/components/layout/Box';
import { useSelectedAccount } from '~/screens/home/useSelectedAccount';
import { ReceiveAppbar } from './ReceiveAppbar';
import { buildAddrLink, buildTransferLink } from '~/util/addrLink';
import { useMemo, useState } from 'react';
import { BigNumber } from 'ethers';
import { SelectableTokenAmountCard } from '~/components/token/SelectableTokenAmountCard';
import { useSelectedToken } from '~/components/token/useSelectedToken';
import { Button } from 'react-native-paper';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { useKeepAwakeWhenFocussed } from '~/util/hook/useKeepAwakeWhenFocussed';
import { AccountSelector } from '../../components/account/AccountSelector/AccountSelector';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { Container } from '~/components/layout/Container';
import { QrCode } from './QrCode';
import { FaucetButton } from './FaucetButton';

export const ReceiveScreen = withSkeleton(
  () => {
    const navigation = useRootNavigation();
    // useKeepAwakeWhenFocussed();  // TODO: re-activate once material bottom tabs navigation integration is fixed

    const [account, setAccount] = useState(useSelectedAccount());

    const token = useSelectedToken();
    const [amount, setAmount] = useState<BigNumber | undefined>();

    const url = useMemo(() => {
      const target_address = account;
      if (!amount) return buildAddrLink({ target_address });

      return buildTransferLink({ target_address }, token, amount);
    }, [account, amount, token]);

    return (
      <Box flex={1}>
        <ReceiveAppbar url={url} />

        <Box flex={1} justifyContent="space-around">
          <Box horizontal justifyContent="center">
            <QrCode value={url} />
          </Box>

          <Container separator={<Box my={1} />} mb={3}>
            <Box mx={4}>
              {amount ? (
                <SelectableTokenAmountCard
                  amount={amount}
                  onChange={setAmount}
                />
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
                      onPress={() =>
                        navigation.navigate('Amount', { onChange: setAmount })
                      }
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
