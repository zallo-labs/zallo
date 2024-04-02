import { useRouter } from 'expo-router';
import { usePropose } from '@api/usePropose';
import { ETH_ADDRESS, FIAT_DECIMALS, UAddress, asAddress, asChain, asFp, asUAddress } from 'lib';
import { useMemo, useState } from 'react';
import { InputType, InputsView } from '#/InputsView';
import { Divider, IconButton } from 'react-native-paper';
import { View } from 'react-native';
import { NumericInput } from '#/fields/NumericInput';
import { DateTime } from 'luxon';
import { Button } from '#/Button';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { AppbarOptions } from '#/Appbar/AppbarOptions';
import { useLocalParams } from '~/hooks/useLocalParams';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import { createStyles } from '@theme/styles';
import { AccountParams } from '~/app/(drawer)/[account]/(home)/_layout';
import { materialCommunityIcon } from '@theme/icons';
import { ListItem, ListItemHeight } from '#/list/ListItem';
import { TokenIcon } from '#/token/TokenIcon';
import { useSwappableTokens } from '~/hooks/swap/useSwappableTokens';
import { TokenAmount } from '#/token/TokenAmount';
import { useSelectToken } from '~/app/(drawer)/[account]/tokens';
import { useSwapRoute } from '~/hooks/swap/useSwapRoute';
import { getSwapOperations } from '~/util/swap/syncswap/swap';
import Decimal from 'decimal.js';
import { ampli } from '~/lib/ampli';
import { SwapToTokenItem } from '#/swap/SwapToTokenItem';
import { showError } from '#/provider/SnackbarProvider';
import { estimateSwap } from '~/util/swap/syncswap/estimate';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';

const DownArrow = materialCommunityIcon('arrow-down-thin');
const ICON_BUTTON_SIZE = 24;

const Query = gql(/* GraphQL */ `
  query SwapScreen($account: UAddress!, $tokens: [UAddress!]!) {
    tokens(input: { address: $tokens }) {
      id
      address
      symbol
      decimals
      price {
        id
        usd
      }
      ...InputsView_token @arguments(account: $account)
      ...TokenIcon_Token
      ...TokenAmount_token
      ...SwapToTokenItem_FromToken
      ...SwapToTokenItem_ToToken
    }
  }
`);

const SwapScreenParams = AccountParams;

function SwapScreen() {
  const { account } = useLocalParams(SwapScreenParams);
  const chain = asChain(account);
  const router = useRouter();
  const propose = usePropose();
  const selectToken = useSelectToken();
  const swappableTokens = useSwappableTokens(chain);

  const { tokens } = useQuery(Query, {
    account,
    tokens: swappableTokens,
  }).data;

  const [fromAddress, setFromAddress] = useState<UAddress>(
    tokens[0]?.address ?? asUAddress(ETH_ADDRESS, chain),
  );
  const [toAddress, setToAddress] = useState<UAddress | undefined>();
  const from = tokens.find((t) => t.address === fromAddress)!;
  const to = toAddress && tokens.find((t) => t.address === toAddress);

  const [input, setInput] = useState('');
  const [type, setType] = useState(InputType.Token);
  const fromAmount = useMemo(
    () =>
      type === InputType.Token
        ? new Decimal(input || '0')
        : new Decimal(input || '0').div(from.price?.usd ?? '0'),
    [from.price?.usd, input, type],
  );

  const route = useSwapRoute({ account, from: asAddress(fromAddress), to: asAddress(toAddress) });

  const selectFrom = async () => {
    const newToken = await selectToken({ account, enabled: swappableTokens });
    if (newToken) {
      if (newToken === toAddress) setToAddress(fromAddress); // Swap to <-> from
      setFromAddress(newToken);
    }
  };

  const selectTo = async () => {
    const newToken = await selectToken({ account, enabled: swappableTokens });
    if (newToken) {
      if (newToken === fromAddress && toAddress) setFromAddress(toAddress); // Swap to <-> from
      setToAddress(newToken);
    }
  };

  return (
    <>
      <AppbarOptions leading="menu" headline="Swap" />

      <ScrollableScreenSurface>
        <InputsView token={from} input={input} setInput={setInput} type={type} setType={setType} />

        <View style={styles.spacer} />

        <View>
          <ListItem
            leading={<TokenIcon token={from} />}
            overline="From"
            headline={<TokenAmount token={from} amount={fromAmount} />}
            onPress={selectFrom}
          />

          {to && route ? (
            <>
              <SwapToTokenItem
                account={account}
                from={from}
                fromAmount={fromAmount}
                to={to}
                route={route}
                selectTo={selectTo}
              />

              <IconButton
                mode="contained-tonal"
                size={ICON_BUTTON_SIZE}
                icon={DownArrow}
                style={styles.arrow}
                onPress={() => {
                  const prevFrom = from.address;
                  setFromAddress(to.address);
                  setToAddress(prevFrom);
                }}
              />
            </>
          ) : (
            <Button mode="contained-tonal" onPress={selectTo} style={styles.selectTokenButton}>
              Select token
            </Button>
          )}
        </View>

        <Divider horizontalInset />

        <NumericInput
          value={input}
          onChange={setInput}
          maxDecimals={type === InputType.Token ? from.decimals : FIAT_DECIMALS}
        />

        <Button
          mode="contained"
          disabled={!fromAmount || !route}
          style={styles.action}
          onPress={
            route
              ? async () => {
                  const fromAmountFp = asFp(fromAmount, from.decimals);
                  const estimatedOut = await estimateSwap({
                    account,
                    route,
                    fromAmount: fromAmountFp,
                  });
                  if (estimatedOut.isErr())
                    return showError('Something went wrong estimating swap');
                  const slippage = 0.05; /* percent [0, 1] */
                  const maxSlip = (estimatedOut.value * BigInt(slippage * 100)) / 100n;

                  const operations = getSwapOperations({
                    account,
                    route,
                    from: asAddress(fromAddress),
                    fromAmount: fromAmountFp,
                    minimumToAmount: estimatedOut.value - maxSlip,
                    deadline: DateTime.now().plus({ months: 3 }),
                  });
                  if (operations.isErr()) return showError('Something went wrong building swap');

                  const proposal = await propose({
                    account,
                    label: `Swap ${from.symbol} for ${to!.symbol}`,
                    operations: operations.value,
                  });
                  if (proposal) {
                    router.push({
                      pathname: `/(drawer)/transaction/[id]`,
                      params: { id: proposal },
                    });
                    ampli.swapProposal({ from: from.address, to: to!.address });
                  } else {
                    showError('Something went wrong proposing swap');
                  }
                }
              : undefined
          }
        >
          Propose
        </Button>
      </ScrollableScreenSurface>
    </>
  );
}

const styles = createStyles({
  spacer: {
    flex: 1,
  },
  selectTokenButton: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  arrow: {
    position: 'absolute',
    right: 24,
    top: ListItemHeight.DOUBLE_LINE - ICON_BUTTON_SIZE,
  },
  action: {
    marginHorizontal: 16,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
});

export default withSuspense(SwapScreen, <ScreenSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
