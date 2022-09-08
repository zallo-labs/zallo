import { SendIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { createTransferTx } from '@token/token';
import { useTokenAvailable } from '@token/useTokenAvailable';
import { BigNumber } from 'ethers';
import { Address, ZERO } from 'lib';
import { useState } from 'react';
import { Appbar, Text } from 'react-native-paper';
import { AddrCard } from '~/components/addr/AddrCard';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { FAB } from '~/components/FAB';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { TokenAvailableCard } from '~/components/token/TokenAvailableCard';
import { useSelectedToken, useSelectToken } from '~/components/token/useSelectedToken';
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
  const styles = useStyles();
  const [propose, proposing] = useProposeTx();
  const [token, selectToken] = [useSelectedToken(), useSelectToken()];
  const available = useTokenAvailable(token, wallet);

  const [amount, setAmount] = useState<BigNumber | undefined>();

  return (
    <Box flex={1}>
      <Appbar.Header>
        <AppbarBack />
        <Appbar.Content title="Send" />
      </Appbar.Header>

      <Container mx={3} separator={<Box my={2} />}>
        <AddrCard addr={to} />

        <TokenAvailableCard
          token={token}
          wallet={wallet}
          onPress={() =>
            navigation.navigate('Tokens', {
              onSelect: (token) => {
                selectToken(token);
                navigation.goBack();
              },
              wallet,
            })
          }
        />

        <Text variant="headlineSmall" style={styles.warning}>
          {amount && available.lt(amount) && 'Insufficient available balance'}
        </Text>

        <AmountInput token={token} amount={amount} setAmount={setAmount} />
      </Container>

      <FAB
        icon={SendIcon}
        label="Send"
        loading={proposing}
        disabled={!amount || amount.eq(ZERO)}
        {...(amount && {
          onPress: () => {
            propose(wallet, createTransferTx(token, to, amount));
          },
        })}
      />
    </Box>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  warning: {
    color: colors.warning,
    textAlign: 'center',
  },
}));
