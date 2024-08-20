import { PaneSkeleton } from '#/skeleton/PaneSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { zUAddress } from '~/lib/zod';
import { AccountParams } from '../_layout';
import { useLocalParams } from '~/hooks/useLocalParams';
import { graphql } from 'relay-runtime';
import { useState } from 'react';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { Pane } from '#/layout/Pane';
import { TokenAmountInput } from '#/token/TokenAmountInput';
import { useLazyQuery } from '~/api';
import { send_SendScreenQuery } from '~/api/__generated__/send_SendScreenQuery.graphql';
import { useSelectedToken } from '~/hooks/useSelectToken';
import { asChain } from 'lib';
import { Scrollable } from '#/Scrollable';
import { Appbar } from '#/Appbar/Appbar';
import { View } from 'react-native';
import { createStyles, useStyles } from '@theme/styles';
import { SendMode, SendModeChips } from '#/send/SendModeChips';
import { ItemList } from '#/layout/ItemList';
import { SendAccount } from '#/send/SendAccount';
import { SendTo } from '#/send/SendTo';
import { match } from 'ts-pattern';
import { TransferMode } from '#/send/TransferMode';
import { TransferFromMode } from '#/send/TransferFromMode';
import { Text } from 'react-native-paper';

const Query = graphql`
  query send_SendScreenQuery($account: UAddress!, $token: UAddress!) {
    token(address: $token) @required(action: THROW) {
      id
      address
      decimals
      balance(input: { account: $account })
      price {
        usd
      }
      ...TokenAmountInput_token
      ...SendAccount_token @arguments(account: $account)
      ...TransferMode_token
      ...TransferFromMode_token
    }

    account(address: $account) @required(action: THROW) {
      address
      ...useProposeTransaction_account
      ...SendAccount_account
      ...TransferMode_account
      ...TransferFromMode_account
    }
  }
`;

export const SendScreenParams = AccountParams.extend({
  to: zUAddress().optional(),
});
export type SendScreenParams = z.infer<typeof SendScreenParams>;

function SendScreen() {
  const params = useLocalParams(SendScreenParams);
  const { styles } = useStyles(stylesheet);
  const chain = asChain(params.account);

  const query = useLazyQuery<send_SendScreenQuery>(Query, {
    account: params.account,
    token: useSelectedToken(chain),
  });
  const { token, account } = query;

  const [amount, setAmount] = useState<Decimal>(new Decimal(0));
  const [mode, setMode] = useState<SendMode>('transfer');
  const [to, setTo] = useState(params.to);

  const warning = amount.gt(token.balance) && 'Insufficient balance';

  return (
    <Pane flex padding={false}>
      <Scrollable contentContainerStyle={styles.container}>
        <Appbar noPadding />
        <View style={styles.inputContainer}>
          <TokenAmountInput
            account={account.address}
            amount={amount}
            onChange={setAmount}
            token={token}
          />
          <Text variant="headlineMedium" style={styles.warning}>
            {warning}
          </Text>
        </View>

        <View style={styles.sendModeChipsContainer}>
          <SendModeChips mode={mode} onChange={setMode} />
        </View>

        <ItemList>
          <SendAccount account={account} token={token} style={styles.item} />
          <SendTo chain={chain} to={to} onChange={setTo} containerStyle={styles.item} />
        </ItemList>

        {match(mode)
          .with('transfer', () => (
            <TransferMode account={account} token={token} to={to} amount={amount} />
          ))
          .exhaustive()}
      </Scrollable>
    </Pane>
  );
}

const stylesheet = createStyles(({ colors, padding, negativeMargin }) => ({
  container: {
    gap: 8,
    paddingHorizontal: padding,
  },
  inputContainer: {
    marginVertical: 16,
  },
  sendModeChipsContainer: {
    marginHorizontal: negativeMargin,
  },
  item: {
    backgroundColor: colors.surface,
  },
  warning: {
    color: colors.warning,
  },
}));

export default withSuspense(SendScreen, <PaneSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
