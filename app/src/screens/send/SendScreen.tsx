import { SendIcon } from '@theme/icons';
import { createTransferTx } from '@token/token';
import { BigNumber } from 'ethers';
import { Address, ZERO } from 'lib';
import { useState } from 'react';
import { Appbar } from 'react-native-paper';
import { AddrCard } from '~/components/addr/AddrCard';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { FAB } from '~/components/FAB';
import { Box } from '~/components/layout/Box';
import { TokenBalanceCard } from '~/components/token/TokenBalanceCard';
import {
  useSelectedToken,
  useSelectToken,
} from '~/components/token/useSelectedToken';
import { useProposeTx } from '~/mutations/tx/propose/useProposeTx';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { WalletId } from '~/queries/wallets';
import { AmountInput } from '../amount/AmountInput';

export interface SendScreenParams {
  wallet: WalletId;
  to: Address;
}

export type SendScreenProps = RootNavigatorScreenProps<'Send'>;

export const SendScreen = ({ route, navigation }: SendScreenProps) => {
  const { wallet, to } = route.params;
  const [propose, proposing] = useProposeTx(wallet);
  const token = useSelectedToken();
  const selectToken = useSelectToken();

  const [amount, setAmount] = useState<BigNumber | undefined>();

  return (
    <Box flex={1}>
      <Appbar.Header>
        <AppbarBack />
        <Appbar.Content title="Send" />
      </Appbar.Header>

      <Box mx={3}>
        <AddrCard addr={to} />

        <Box mt={3} mb={4}>
          <TokenBalanceCard
            token={token}
            wallet={wallet}
            onPress={() =>
              navigation.navigate('Tokens', { onSelect: selectToken })
            }
          />
        </Box>

        <AmountInput token={token} amount={amount} setAmount={setAmount} />
      </Box>

      <FAB
        icon={SendIcon}
        label="Send"
        loading={proposing}
        disabled={!amount || amount.eq(ZERO)}
        {...(amount && {
          onPress: () => {
            propose(createTransferTx(token, to, amount));
          },
        })}
      />
    </Box>
  );
};
