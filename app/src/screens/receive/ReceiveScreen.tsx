import { Box } from '~/components/layout/Box';
import {
  useSelectedWallet,
  useSelectWallet,
} from '~/components/wallet/useSelectedWallet';
import { ReceiveAppbar } from './ReceiveAppbar';
import { buildAddrLink, buildTransferLink } from '~/util/addrLink';
import { useMemo, useState } from 'react';
import { BigNumber } from 'ethers';
import { SelectableTokenAmount } from '~/components/token/SelectableTokenAmount';
import { useSelectedToken } from '~/components/token/useSelectedToken';
import { Button } from 'react-native-paper';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { useKeepAwakeWhenFocussed } from '~/util/hook/useKeepAwakeWhenFocussed';
import { ZERO_ADDR } from 'lib';
import { Suspend } from '~/components/Suspender';
import { WalletSelector } from '../home/WalletSelector/WalletSelector';
import { ReceiveIcon } from '~/util/theme/icons';
import { StyleSheet } from 'react-native';
import { useFaucet } from '~/mutations/useFacuet.api';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { Container } from '~/components/layout/Container';
import { QrCode } from './QrCode';

export const ReceiveScreen = withSkeleton(
  () => {
    const navigation = useRootNavigation();
    const wallet = useSelectedWallet();
    const selectWallet = useSelectWallet();
    const faucet = useFaucet(wallet?.accountAddr, true);
    useKeepAwakeWhenFocussed();

    const token = useSelectedToken();
    const [amount, setAmount] = useState<BigNumber | undefined>();

    const url = useMemo(() => {
      const target_address = wallet?.accountAddr ?? ZERO_ADDR;
      if (!amount) return buildAddrLink({ target_address });

      return buildTransferLink({ target_address }, token, amount);
    }, [wallet?.accountAddr, amount, token]);

    if (!wallet) return <Suspend />;

    return (
      <Box flex={1}>
        <ReceiveAppbar url={url} />

        <Box flex={1} justifyContent="space-around">
          <Box horizontal justifyContent="center">
            <QrCode value={url} />
          </Box>

          <Container separator={<Box my={1} />} mb={3}>
            <Box
              display="flex"
              flexDirection="row-reverse"
              justifyContent="space-between"
              alignItems="center"
              mx={4}
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

              {faucet && (
                <Button
                  mode="outlined"
                  icon={ReceiveIcon}
                  style={styles.facuet}
                  onPress={faucet}
                >
                  Testnet funds
                </Button>
              )}
            </Box>

            {amount && (
              <SelectableTokenAmount amount={amount} onChange={setAmount} />
            )}

            <WalletSelector selected={wallet} onSelect={selectWallet} />
          </Container>
        </Box>
      </Box>
    );
  },
  () => <ScreenSkeleton menu mode="center-aligned" />,
);

const styles = StyleSheet.create({
  facuet: {
    flexShrink: 1,
  },
});
