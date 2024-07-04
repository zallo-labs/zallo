import { useRouter } from 'expo-router';
import { useProposeTransaction } from '~/hooks/mutations/useProposeTransaction';
import { FIAT_DECIMALS, asAddress, asChain, asFp, asUAddress } from 'lib';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-paper';
import { useAddressLabel } from '#/address/AddressLabel';
import { NumericInput } from '#/fields/NumericInput';
import { TokenItem } from '#/token/TokenItem';
import { InputsView, InputType } from '../../../components/InputsView';
import { Button } from '#/Button';
import { useInvalidateRecentToken, useSelectToken, useSelectedToken } from '~/hooks/useSelectToken';
import { createTransferOp } from '~/lib/transfer';
import { AppbarOptions } from '#/Appbar/AppbarOptions';
import { z } from 'zod';
import { zAddress, zUAddress } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { Actions } from '#/layout/Actions';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import Decimal from 'decimal.js';
import { ampli } from '~/lib/ampli';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { send_SendScreenQuery } from '~/api/__generated__/send_SendScreenQuery.graphql';

const Query = graphql`
  query send_SendScreenQuery($account: UAddress!, $token: UAddress!) {
    token(address: $token) @required(action: LOG) {
      id
      address
      decimals
      balance(input: { account: $account })
      price {
        id
        usd
      }
      ...InputsView_token @arguments(account: $account)
      ...TokenItem_token
    }
  }
`;

const SendScreenParams = z.object({
  account: zUAddress(),
  to: zAddress(),
});
export type SendScreenParams = z.infer<typeof SendScreenParams>;

function SendScreen() {
  const { account, to } = useLocalParams(SendScreenParams);
  const chain = asChain(account);
  const router = useRouter();
  const propose = useProposeTransaction();
  const toLabel = useAddressLabel(asUAddress(to, chain));
  const invalidateRecent = useInvalidateRecentToken(chain);
  const selectToken = useSelectToken();
  const selectedToken = useSelectedToken(chain);

  const token = useLazyLoadQuery<send_SendScreenQuery>(Query, {
    account,
    token: selectedToken,
  })?.token;

  const [input, setInput] = useState('');
  const [type, setType] = useState(InputType.Token);

  useEffect(() => {
    if (!token) invalidateRecent(selectedToken);
  }, [chain, invalidateRecent, selectedToken, token]);

  if (!token) return null;

  const inputAmount = input || '0';
  const amount =
    type === InputType.Token
      ? new Decimal(inputAmount)
      : new Decimal(inputAmount).div(token.price?.usd ?? 0);

  return (
    <>
      <AppbarOptions leading="menu" headline={`Transfer to ${toLabel}`} />

      <ScrollableScreenSurface>
        <InputsView token={token} input={input} setInput={setInput} type={type} setType={setType} />

        <View style={styles.spacer} />

        <TokenItem token={token} amount={token.balance} onPress={() => selectToken({ account })} />
        <Divider horizontalInset />

        <NumericInput
          value={input}
          onChange={setInput}
          maxDecimals={type === InputType.Token ? token.decimals : FIAT_DECIMALS}
        />

        <Actions flex={false}>
          <Button
            mode="contained"
            style={styles.action}
            onPress={async () => {
              const proposal = await propose({
                account,
                operations: [
                  createTransferOp({
                    token: asAddress(token.address),
                    to,
                    amount: asFp(amount, token.decimals),
                  }),
                ],
              });
              if (!proposal) return;

              router.replace({
                pathname: `/(nav)/transaction/[id]`,
                params: { id: proposal },
              });
              ampli.transferProposal({ token: token.address });
            }}
          >
            Propose
          </Button>
        </Actions>
      </ScrollableScreenSurface>
    </>
  );
}

const styles = StyleSheet.create({
  spacer: {
    flex: 1,
  },
  action: {
    marginHorizontal: 16,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
});

export default withSuspense(SendScreen, ScreenSkeleton);

export { ErrorBoundary } from '#/ErrorBoundary';
