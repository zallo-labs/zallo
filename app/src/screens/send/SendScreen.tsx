import { usePropose } from '@api/proposal';
import { CloseIcon } from '@theme/icons';
import { FIAT_DECIMALS, valueAsTokenAmount } from '@token/fiat';
import { parseUnits } from 'ethers/lib/utils';
import { Address } from 'lib';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Divider } from 'react-native-paper';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { NumericInput } from '~/components/fields/NumericInput';
import { Screen } from '~/components/layout/Screen';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TokenItem } from '~/components/token/TokenItem2';
import { useSelectedToken, useSetSelectedToken2 } from '~/components/token/useSelectedToken';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { InputsView, InputType } from '../../components/InputsView';
import { useSelectToken } from '../tokens/TokensScreen';
import { Button } from '~/components/Button';
import { createTransferOp } from './transfer';
import { gql } from '@api/gen';
import { useSuspenseQuery } from '@apollo/client';
import { SendScreenQuery, SendScreenQueryVariables } from '@api/gen/graphql';
import { SendScreenDocument } from '@api/generated';

gql(/* GraphQL */ `
  query SendScreen($account: Address!, $token: Address!) {
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

export interface SendScreenParams {
  account: Address;
  to: Address;
}

export type SendScreenProps = StackNavigatorScreenProps<'Send'>;

export const SendScreen = withSuspense(
  ({ route, navigation: { navigate, goBack } }: SendScreenProps) => {
    const { account, to } = route.params;
    const propose = usePropose();

    const { token } = useSuspenseQuery<SendScreenQuery, SendScreenQueryVariables>(
      SendScreenDocument,
      { variables: { account: route.params.account, token: useSelectedToken().address } },
    ).data;

    const selectToken = useSelectToken();
    const setToken = useSetSelectedToken2();

    const [input, setInput] = useState('');
    const [type, setType] = useState(InputType.Fiat);

    if (!token) return null; // TODO: handle

    const inputAmount = (() => {
      const n = parseFloat(input);
      return isNaN(n) ? '0' : n.toString();
    })();

    const tokenAmount =
      type === InputType.Token
        ? parseUnits(inputAmount, token.decimals).toBigInt()
        : valueAsTokenAmount(parseFloat(inputAmount), token.price?.current ?? 0, token.decimals);

    return (
      <Screen>
        <Appbar.Header>
          <Appbar.Action icon={CloseIcon} onPress={goBack} />
          <Appbar.Content title={`Send to ${useAddressLabel(to)}`} />
        </Appbar.Header>

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
            navigate('Proposal', { proposal });
          }}
        >
          Propose
        </Button>
      </Screen>
    );
  },
  ScreenSkeleton,
);

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
