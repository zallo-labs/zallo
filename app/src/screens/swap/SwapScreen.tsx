import { popToProposal, usePropose } from '@api/proposal';
import { fiatToToken, fiatAsBigInt, FIAT_DECIMALS } from '@token/fiat';
import { useTokenPriceData } from '@uniswap/useTokenPrice';
import { parseUnits } from 'ethers/lib/utils';
import { Address, compareAddress } from 'lib';
import { useState } from 'react';
import { InputType, InputsView } from '~/components/InputsView';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useSelectedToken } from '~/components/token/useSelectedToken';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Divider } from 'react-native-paper';
import { makeStyles } from '@theme/makeStyles';
import { Screen } from '~/components/layout/Screen';
import { Appbar } from '~/components/Appbar/Appbar';
import { View } from 'react-native';
import { NumericInput } from '~/components/fields/NumericInput';
import { SwapTokens } from './SwapTokens';
import { useMaybeToken, useToken } from '@token/useToken';
import deepEqual from 'fast-deep-equal';
import { getSwapOperations, useSwapPools } from '~/util/swap';
import { DateTime } from 'luxon';
import { Button } from '~/components/Button';

export interface SwapScreenParams {
  account: Address;
}

export type SwapScreenProps = StackNavigatorScreenProps<'Swap'>;

export const SwapScreen = withSuspense(({ route }: SwapScreenProps) => {
  const { account } = route.params;
  const styles = useStyles();
  const propose = usePropose();

  const [from, setFrom] = useState(useSelectedToken().address);
  const fromToken = useToken(from);
  const fromPrice = useTokenPriceData(from).current;

  const [input, setInput] = useState('');
  const [type, setType] = useState(InputType.Fiat);

  const fromInput = (() => {
    const n = parseFloat(input);
    return isNaN(n) ? '0' : n.toString();
  })();

  const fromAmount =
    type === InputType.Token
      ? parseUnits(fromInput, fromToken.decimals).toBigInt()
      : fiatToToken(fiatAsBigInt(fromInput), fromPrice, fromToken);

  const [to, setTo] = useState<Address | undefined>();
  const toToken = useMaybeToken(to);

  const pools = useSwapPools();
  const pair = to ? ([from, to].sort(compareAddress) as [Address, Address]) : undefined;
  const pool = pair ? pools.find((p) => deepEqual(p.pair, pair)) : undefined;

  return (
    <Screen>
      <Appbar mode="small" leading="back" headline="Swap" />

      <InputsView
        account={account}
        token={fromToken}
        input={input}
        setInput={setInput}
        type={type}
        setType={setType}
      />

      <View style={styles.spacer} />

      <SwapTokens
        account={account}
        from={from}
        setFrom={setFrom}
        fromAmount={fromAmount}
        to={to}
        setTo={setTo}
      />

      <Divider horizontalInset />

      <NumericInput
        value={input}
        onChange={setInput}
        maxDecimals={type === InputType.Token ? fromToken.decimals : FIAT_DECIMALS}
      />

      <Button
        mode="contained"
        disabled={!fromAmount || !pool}
        style={styles.action}
        onPress={async () => {
          propose(
            {
              account,
              label: `Swap ${fromToken.symbol} for ${toToken?.symbol}`,
              operations: await getSwapOperations({
                account,
                pool: pool!,
                from: {
                  token: from,
                  amount: fromAmount,
                },
                slippage: 0.01, // 1%
                deadline: DateTime.now().plus({ months: 3 }),
              }),
            },
            popToProposal,
          );
        }}
      >
        Propose
      </Button>
    </Screen>
  );
}, ScreenSkeleton);

const useStyles = makeStyles(() => ({
  spacer: {
    flex: 1,
  },
  action: {
    marginHorizontal: 16,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
}));
