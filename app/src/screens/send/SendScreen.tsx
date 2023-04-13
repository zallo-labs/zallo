import { popToProposal, usePropose } from '@api/proposal';
import { CloseIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { fiatAsBigInt, fiatToToken, FIAT_DECIMALS } from '@token/fiat';
import { getTokenContract, Token } from '@token/token';
import { useTokenPriceData } from '@uniswap/index';
import { parseUnits } from 'ethers/lib/utils';
import { Address, asHex, Call } from 'lib';
import { useState } from 'react';
import { View } from 'react-native';
import { Appbar, Button, Divider } from 'react-native-paper';
import { useSelectedAccountId } from '~/components/AccountSelector/useSelectedAccount';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { NumericInput } from '~/components/fields/NumericInput';
import { Screen } from '~/components/layout/Screen';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TokenItem } from '~/components/token/TokenItem';
import { useSelectedToken, useSetSelectedToken } from '~/components/token/useSelectedToken';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useSelectToken } from '../tokens/useSelectToken';
import { InputsView, InputType } from './InputsView';

const createTransferTx = (token: Token, to: Address, amount: bigint): Call =>
  token.type === 'ERC20'
    ? {
        to: token.address,
        data: asHex(getTokenContract(token).interface.encodeFunctionData('transfer', [to, amount])),
      }
    : { to, value: amount };

export interface SendScreenParams {
  to: Address;
}

export type SendScreenProps = StackNavigatorScreenProps<'Send'>;

export const SendScreen = withSuspense(({ route, navigation: { goBack } }: SendScreenProps) => {
  const { to } = route.params;
  const styles = useStyles();
  const account = useSelectedAccountId();
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

      <InputsView input={input} setInput={setInput} type={type} setType={setType} />

      <View style={styles.spacer} />

      <TokenItem
        token={token}
        account={account}
        onPress={async () => setToken(await selectToken())}
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
        onPress={() => propose(createTransferTx(token, to, tokenAmount), account, popToProposal)}
      >
        Propose
      </Button>
    </Screen>
  );
}, ScreenSkeleton);

const useStyles = makeStyles(({ colors, fonts }) => ({
  spacer: {
    flex: 1,
  },
  action: {
    marginHorizontal: 16,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
}));
