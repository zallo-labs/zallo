import { SendIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { createTransferTx } from '@token/token';
import { useTokenAvailable } from '@token/useTokenAvailable';
import { BigNumber } from 'ethers';
import { Address, UserId, ZERO } from 'lib';
import { useState } from 'react';
import { Appbar, Text } from 'react-native-paper';
import { AddrCard } from '~/components/addr/AddrCard';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { FAB } from '~/components/FAB';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { TokenAvailableCard } from '~/components/token/TokenAvailableCard';
import {
  useSelectedToken,
  useSelectToken,
} from '~/components/token/useSelectedToken';
import {
  popToProposal,
  usePropose,
} from '~/mutations/proposal/propose/usePropose';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { AmountInput } from '../amount/AmountInput';

export interface SendScreenParams {
  user: UserId;
  to: Address;
}

export type SendScreenProps = RootNavigatorScreenProps<'Send'>;

export const SendScreen = ({ route, navigation }: SendScreenProps) => {
  const { user, to } = route.params;
  const styles = useStyles();
  const [propose, proposing] = usePropose();
  const [token, selectToken] = [useSelectedToken(), useSelectToken()];
  const available = useTokenAvailable(token, user);

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
          user={user}
          onPress={() =>
            navigation.navigate('Tokens', {
              user,
              onSelect: (token) => {
                selectToken(token);
                navigation.goBack();
              },
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
            propose(
              user.account,
              createTransferTx(token, to, amount),
              popToProposal,
            );
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
