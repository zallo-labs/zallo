import { useRouter } from 'expo-router';
import { usePropose } from '@api/usePropose';
import { FIAT_DECIMALS, asAddress, asChain, asFp, asUAddress } from 'lib';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-paper';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { NumericInput } from '~/components/fields/NumericInput';
import { TokenItem } from '~/components/token/TokenItem';
import { useSelectedToken, useSetSelectedToken } from '~/hooks/useSelectedToken';
import { InputsView, InputType } from '../../../components/InputsView';
import { Button } from '~/components/Button';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { useSelectToken } from '~/app/(drawer)/[account]/tokens';
import { createTransferOp } from '~/lib/transfer';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { z } from 'zod';
import { zAddress, zUAddress } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { Actions } from '~/components/layout/Actions';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import Decimal from 'decimal.js';

const Query = gql(/* GraphQL */ `
  query TransferScreen($account: UAddress!, $token: UAddress!) {
    token(input: { address: $token }) {
      id
      address
      decimals
      balance(input: { account: $account })
      price {
        id
        usd
      }
      ...InputsView_token @arguments(account: $account)
      ...TokenItem_Token
    }
  }
`);

const TransferScreenParams = z.object({
  account: zUAddress(),
  to: zAddress(),
});
export type TransferScreenParams = z.infer<typeof TransferScreenParams>;

function TransferScreen() {
  const { account, to } = useLocalParams(TransferScreenParams);
  const chain = asChain(account);
  const router = useRouter();
  const propose = usePropose();
  const toLabel = useAddressLabel(asUAddress(to, chain));

  const { token } = useQuery(Query, {
    account,
    token: useSelectedToken(chain),
  }).data;

  const selectToken = useSelectToken();
  const setToken = useSetSelectedToken(chain);

  const [input, setInput] = useState('');
  const [type, setType] = useState(InputType.Fiat);

  if (!token) return null; // TODO: handle

  const inputAmount = input || '0';
  const amount =
    type === InputType.Token
      ? new Decimal(inputAmount)
      : new Decimal(inputAmount).div(token.price?.usd ?? 0);

  return (
    <>
      <AppbarOptions leading="menu" headline={`Transfer to ${toLabel}`} />

      <ScreenSurface>
        <InputsView token={token} input={input} setInput={setInput} type={type} setType={setType} />

        <View style={styles.spacer} />

        <TokenItem
          token={token}
          amount={token.balance}
          onPress={async () => {
            const token = await selectToken({ account });
            if (token) setToken(token);
          }}
        />
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
              router.push({
                pathname: `/(drawer)/transaction/[id]/`,
                params: { id: proposal },
              });
            }}
          >
            Propose
          </Button>
        </Actions>
      </ScreenSurface>
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

export default withSuspense(TransferScreen, ScreenSkeleton);
