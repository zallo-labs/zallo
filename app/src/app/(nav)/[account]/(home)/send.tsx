import { PaneSkeleton } from '#/skeleton/PaneSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { zAddress } from '~/lib/zod';
import { AccountParams } from '../_layout';
import { useLocalParams } from '~/hooks/useLocalParams';
import { graphql } from 'relay-runtime';
import { useState } from 'react';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { Pane } from '#/layout/Pane';
import { TokenAmountInput } from '#/token/TokenAmountInput';
import { useLazyQuery } from '~/api';
import { send_SendScreen2Query } from '~/api/__generated__/send_SendScreen2Query.graphql';
import { useSelectedToken } from '~/hooks/useSelectToken';
import { asChain } from 'lib';
import { Scrollable } from '#/Scrollable';
import { Appbar } from '#/Appbar/Appbar';
import { View } from 'react-native';

const Query = graphql`
  query send_SendScreen2Query($account: UAddress!, $token: UAddress!) {
    token(address: $token) @required(action: THROW) {
      id
      address
      decimals
      balance(input: { account: $account })
      price {
        id
        usd
      }
      ...TokenAmountInput_token
    }

    account(address: $account) @required(action: THROW) {
      ...useProposeTransaction_account
    }
  }
`;

export const SendScreenParams = AccountParams.extend({
  to: zAddress().optional(),
});
export type SendScreenParams = z.infer<typeof SendScreenParams>;

function SendScreen() {
  const { account, ...params } = useLocalParams(SendScreenParams);

  const { token } = useLazyQuery<send_SendScreen2Query>(Query, {
    account,
    token: useSelectedToken(asChain(account)),
  });

  const [amount, setAmount] = useState<Decimal>(new Decimal(0));
  const [to, setTo] = useState(params.to);

  return (
    <Pane flex>
      <Scrollable>
        <Appbar />
        <TokenAmountInput account={account} amount={amount} onChange={setAmount} token={token} />
      </Scrollable>
    </Pane>
  );
}

export default withSuspense(SendScreen, <PaneSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
