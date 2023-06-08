import { popToProposal, usePropose } from '@api/proposal';
import { CloseIcon } from '@theme/icons';
import { fiatAsBigInt, fiatToToken, FIAT_DECIMALS } from '@token/fiat';
import { getTokenContract, Token } from '@token/token';
import { useTokenPriceData } from '@uniswap/index';
import { parseUnits } from 'ethers/lib/utils';
import { Address, asHex, Operation } from 'lib';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Divider } from 'react-native-paper';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { NumericInput } from '~/components/fields/NumericInput';
import { Screen } from '~/components/layout/Screen';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TokenItem } from '~/components/token/TokenItem';
import { useSelectedToken, useSetSelectedToken } from '~/components/token/useSelectedToken';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { InputsView, InputType } from './InputsView';
import { useSelectToken } from '../tokens/TokensScreen';
import { Button } from '~/components/Button';

const createTransferOp = (token: Token, to: Address, amount: bigint): Operation =>
  token.type === 'ERC20'
    ? {
        to: token.address,
        data: asHex(getTokenContract(token).interface.encodeFunctionData('transfer', [to, amount])),
      }
    : { to, value: amount };

export interface SendScreenParams {
  account: Address;
  to: Address;
}

export type SendScreenProps = StackNavigatorScreenProps<'Send'>;

export const SendScreen = withSuspense(({ route, navigation: { goBack } }: SendScreenProps) => {
  const { account, to } = route.params;
  const [token, setToken] = [useSelectedToken(), useSetSelectedToken()];
  const selectToken = useSelectToken();
  const propose = usePropose();
  const price = useTokenPriceData(token).current;

  const [input, setInput] = useState('');
  const [type, setType] = useState(InputType.Fiat);

  const inputAmount = (() => {
    const n = parseFloat(input);
    return isNaN(n) ? '0' : n.toString();
  })();

  const tokenAmount =
    type === InputType.Token
      ? parseUnits(inputAmount, token.decimals).toBigInt()
      : fiatToToken(fiatAsBigInt(inputAmount), price, token);

  return (
    <Screen>
      <Appbar.Header>
        <Appbar.Action icon={CloseIcon} onPress={goBack} />
        <Appbar.Content title={`Send to ${useAddressLabel(to)}`} />
      </Appbar.Header>

      <InputsView
        account={account}
        input={input}
        setInput={setInput}
        type={type}
        setType={setType}
      />

      <View style={styles.spacer} />

      <TokenItem
        token={token.address}
        account={account}
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
        onPress={() =>
          propose(
            {
              account,
              operations: [createTransferOp(token, to, tokenAmount)],
            },
            popToProposal,
          )
        }
      >
        Propose
      </Button>
    </Screen>
  );
}, ScreenSkeleton);

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
