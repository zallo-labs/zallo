import { SearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import { asAddress } from 'lib';
import { usePropose } from '@api/usePropose';
import { parseUnits } from 'ethers/lib/utils';
import { Address, FIAT_DECIMALS, fiatToToken } from 'lib';
import { useState } from 'react';
import { InputType, InputsView } from '~/components/InputsView';
import { useSelectedToken } from '~/hooks/useSelectedToken';
import { Divider } from 'react-native-paper';
import { makeStyles } from '@theme/makeStyles';
import { View } from 'react-native';
import { NumericInput } from '~/components/fields/NumericInput';
import { SwapTokens } from '~/components/swap/SwapTokens';
import { getSwapOperations, useSwapPools } from '~/util/swap';
import { DateTime } from 'luxon';
import { Button } from '~/components/Button';
import { gql } from '@api/generated';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';
import { useQuery } from '~/gql';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';

const Query = gql(/* GraphQL */ `
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
      ...SwapTokens_fromToken
    }

    to: token(input: { address: $to }) @skip(if: $skipTo) {
      id
      symbol
      ...SwapTokens_toToken
    }

    tokens {
      id
      address
    }
  }
`);

export type SwapScreenRoute = `/[account]/swap`;
export type SwapScreenParams = SearchParams<SwapScreenRoute>;

export default function SwapScreen() {
  const account = asAddress(useLocalSearchParams<SwapScreenParams>().account);
  const styles = useStyles();
  const router = useRouter();
  const propose = usePropose();

  const [fromAddress, setFromAddress] = useState(useSelectedToken());
  const [toAddress, setToAddress] = useState<Address | undefined>();

  const { from, to, tokens } = useQuery(Query, {
    account,
    from: fromAddress,
    to: toAddress || ETH_ADDRESS,
    skipTo: !toAddress,
  }).data;

  const [input, setInput] = useState('');
  const [type, setType] = useState(InputType.Fiat);

  const pools = useSwapPools(
    fromAddress,
    tokens.map((t) => t.address),
  );
  const pool = toAddress && pools.find((p) => p.pair.includes(toAddress));

  if (!from) return null; // TODO: handle

  const fromInput = input || '0';
  const fromAmount =
    type === InputType.Token
      ? parseUnits(fromInput, from.decimals).toBigInt()
      : fiatToToken(parseFloat(fromInput), from.price?.current ?? 0, from.decimals);

  return (
    <View style={styles.root}>
      <AppbarOptions headline="Swap" />

      <InputsView token={from} input={input} setInput={setInput} type={type} setType={setType} />

      <View style={styles.spacer} />

      <SwapTokens
        account={account}
        from={from}
        setFromAddress={setFromAddress}
        fromAmount={fromAmount}
        to={to}
        setToAddress={setToAddress}
        pools={pools}
        pool={pool}
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
          router.replace({ pathname: `/transaction/[hash]/`, params: { hash: proposal } });
        }}
      >
        Propose
      </Button>
    </View>
  );
}

const useStyles = makeStyles(() => ({
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
}));
