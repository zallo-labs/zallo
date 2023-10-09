import { SearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import { usePropose } from '@api/usePropose';
import { parseUnits } from 'ethers/lib/utils';
import { FIAT_DECIMALS, asAddress, fiatToToken } from 'lib';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-paper';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { NumericInput } from '~/components/fields/NumericInput';
import { TokenItem } from '~/components/token/TokenItem';
import { useSelectedToken, useSetSelectedToken } from '~/hooks/useSelectedToken';
import { InputsView, InputType } from '../../components/InputsView';
import { Button } from '~/components/Button';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { useSelectToken } from '~/app/[account]/tokens';
import { createTransferOp } from '~/lib/transfer';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';

const Query = gql(/* GraphQL */ `
  query TransferScreen($account: Address!, $token: Address!) {
    token(input: { address: $token }) {
      id
      address
      decimals
      balance(input: { account: $account })
      price {
        id
        current
      }
      ...InputsView_token @arguments(account: $account)
      ...TokenItem_token
    }
  }
`);

export type TransferScreenRoute = `/[account]/transfer`;
export type TransferScreenParams = SearchParams<TransferScreenRoute> & {
  to: string;
};

export default function TransferScreen() {
  const params = useLocalSearchParams<TransferScreenParams>();
  const [account, to] = [asAddress(params.account), asAddress(params.to)];
  const router = useRouter();
  const propose = usePropose();
  const toLabel = useAddressLabel(to);

  const { token } = useQuery(Query, {
    account: asAddress(params.account),
    token: useSelectedToken(),
  }).data;

  const selectToken = useSelectToken();
  const setToken = useSetSelectedToken();

  const [input, setInput] = useState('');
  const [type, setType] = useState(InputType.Fiat);

  if (!token) return null; // TODO: handle

  const inputAmount = input || '0';
  const tokenAmount =
    type === InputType.Token
      ? parseUnits(inputAmount, token.decimals).toBigInt()
      : fiatToToken(parseFloat(inputAmount), token.price?.current ?? 0, token.decimals);

  return (
    <View style={styles.root}>
      <AppbarOptions headline={`Transfer to ${toLabel}`} />

      <InputsView token={token} input={input} setInput={setInput} type={type} setType={setType} />

      <View style={styles.spacer} />

      <TokenItem
        token={token}
        amount={token.balance}
        onPress={async () => setToken(await selectToken({ account }))}
      />
      <Divider horizontalInset />

      <NumericInput
        value={input}
        onChange={setInput}
        maxDecimals={type === InputType.Token ? token.decimals : FIAT_DECIMALS}
      />

      <Button
        mode="contained"
        style={styles.action}
        onPress={async () => {
          const proposal = await propose({
            account,
            operations: [createTransferOp({ token: token.address, to, amount: tokenAmount })],
          });
          router.replace({ pathname: `/proposal/[hash]`, params: { hash: proposal } });
        }}
      >
        Propose
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  action: {
    marginHorizontal: 16,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
});
