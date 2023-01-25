import { makeStyles } from '@theme/makeStyles';
import { getTokenContract, Token } from '@token/token';
import { useTokenAvailable } from '@token/useTokenAvailable';
import { BigNumber } from 'ethers';
import { Address, Call, QuorumGuid, ZERO } from 'lib';
import { useState } from 'react';
import { Appbar, Text } from 'react-native-paper';
import { AddrCard } from '~/components/addr/AddrCard';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { ActionButton } from '~/components/buttons/ActionButton';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { TokenAvailableCard } from '~/components/token/TokenAvailableCard';
import {
  useSelectedToken,
  useSelectToken as useSetSelectedToken,
} from '~/components/token/useSelectedToken';
import { popToProposal, usePropose } from '~/mutations/proposal/propose/usePropose';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { AmountInput } from '../amount/AmountInput';
import { useSelectToken } from '../tokens/useSelectToken';

const createTransferTx = (token: Token, to: Address, amount: BigNumber): Call =>
  token.type === 'ERC20'
    ? {
        to: token.addr,
        data: getTokenContract(token).interface.encodeFunctionData('transfer', [to, amount]),
      }
    : { to, value: amount };

export interface SendScreenParams {
  quorum: QuorumGuid;
  to: Address;
}

export type SendScreenProps = StackNavigatorScreenProps<'Send'>;

export const SendScreen = ({ route, navigation }: SendScreenProps) => {
  const { quorum, to } = route.params;
  const styles = useStyles();
  const selectToken = useSelectToken({ account: quorum });
  const [propose, proposing] = usePropose();
  const [token, setSelectToken] = [useSelectedToken(), useSetSelectedToken()];
  const available = useTokenAvailable(token, quorum);

  const [amount, setAmount] = useState<BigNumber | undefined>();

  return (
    <Box flex={1}>
      <Appbar.Header>
        <AppbarBack />
        <Appbar.Content title="Send" />
      </Appbar.Header>

      <Container mx={3} separator={<Box mt={2} />}>
        <AddrCard addr={to} />

        <TokenAvailableCard
          token={token}
          account={quorum}
          onPress={async () => {
            setSelectToken(await selectToken());
            navigation.goBack();
          }}
        />

        <Text variant="headlineSmall" style={styles.warning}>
          {amount && available.lt(amount) && 'Insufficient available balance'}
        </Text>

        <AmountInput token={token} amount={amount} setAmount={setAmount} />
      </Container>

      <ActionButton
        loading={proposing}
        disabled={!amount || amount.eq(ZERO)}
        {...(amount && {
          onPress: () => {
            propose(quorum, createTransferTx(token, to, amount), popToProposal);
          },
        })}
      >
        Send
      </ActionButton>
    </Box>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  warning: {
    color: colors.warning,
    textAlign: 'center',
  },
}));
