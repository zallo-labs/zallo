import { usePropose } from '@api/proposal';
import { fiatToToken, fiatAsBigInt, FIAT_DECIMALS, valueAsTokenAmount } from '@token/fiat';
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
import deepEqual from 'fast-deep-equal';
import { getSwapOperations, useSwapPools } from '~/util/swap';
import { DateTime } from 'luxon';
import { Button } from '~/components/Button';
import { gql } from '@api/gen';
import { useSuspenseQuery } from '@apollo/client';
import { SwapScreenQuery, SwapScreenQueryVariables } from '@api/gen/graphql';
import { SwapScreenDocument } from '@api/generated';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';

gql(/* GraphQL */ `
  query SwapScreen($account: Address!, $from: Address!, $to: Address!, $skipTo: Boolean!) {
    from: token(input: { address: $from }) {
      id
      symbol
      decimals
      price {
        id
        current
      }
      ...InputsView_token @arguments(account: $account)
    }

    to: token(input: { address: $to }) @skip(if: $skipTo) {
      id
      symbol
    }
  }
`);

export interface SwapScreenParams {
  account: Address;
}

export type SwapScreenProps = StackNavigatorScreenProps<'Swap'>;

export const SwapScreen = withSuspense(({ route, navigation: { navigate } }: SwapScreenProps) => {
  const { account } = route.params;
  const styles = useStyles();
  const propose = usePropose();

  const [fromAddress, setFromAddress] = useState(useSelectedToken().address);
  const [toAddress, setToAddress] = useState<Address | undefined>();

  const { from, to } = useSuspenseQuery<SwapScreenQuery, SwapScreenQueryVariables>(
    SwapScreenDocument,
    { variables: { account, from: fromAddress, to: toAddress || ETH_ADDRESS, skipTo: !toAddress } },
  ).data;

  const [input, setInput] = useState('');
  const [type, setType] = useState(InputType.Fiat);

  const pools = useSwapPools();
  const pair = toAddress
    ? ([fromAddress, toAddress].sort(compareAddress) as [Address, Address])
    : undefined;
  const pool = pair ? pools.find((p) => deepEqual(p.pair, pair)) : undefined;

  if (!from) return null; // TODO: handle

  const fromInput = (() => {
    const n = parseFloat(input);
    return isNaN(n) ? '0' : n.toString();
  })();

  const fromAmount =
    type === InputType.Token
      ? parseUnits(fromInput, from.decimals).toBigInt()
      : valueAsTokenAmount(parseFloat(fromInput), from.price?.current ?? 0, from.decimals);

  return (
    <Screen>
      <Appbar mode="small" leading="back" headline="Swap" />

      <InputsView token={from} input={input} setInput={setInput} type={type} setType={setType} />

      <View style={styles.spacer} />

      <SwapTokens
        account={account}
        from={fromAddress}
        setFrom={setFromAddress}
        fromAmount={fromAmount}
        to={toAddress}
        setTo={setToAddress}
      />

      <Divider horizontalInset />

      <NumericInput
        value={input}
        onChange={setInput}
        maxDecimals={type === InputType.Token ? from.decimals : FIAT_DECIMALS}
      />

      <Button
        mode="contained"
        disabled={!fromAmount || !pool}
        style={styles.action}
        onPress={async () => {
          const proposal = await propose({
            account,
            label: `Swap ${from.symbol} for ${to!.symbol}`,
            operations: await getSwapOperations({
              account,
              pool: pool!,
              from: {
                token: fromAddress,
                amount: fromAmount,
              },
              slippage: 0.01, // 1%
              deadline: DateTime.now().plus({ months: 3 }),
            }),
          });
          navigate('Proposal', { proposal });
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
