import { useToken, useTokens } from '@token/useToken';
import { Address, compareAddress } from 'lib';
import { StyleSheet, View } from 'react-native';
import { ListItem } from '~/components/list/ListItem';
import { useFormattedTokenAmount } from '~/components/token/TokenAmount';
import { useSelectToken } from '../tokens/TokensScreen';
import { Button, IconButton } from 'react-native-paper';
import { materialCommunityIcon } from '@theme/icons';
import { Dispatch, SetStateAction } from 'react';
import { ListItemHeight } from '~/components/list/ListItem';
import { useSwapPools } from '~/util/swap';
import deepEqual from 'fast-deep-equal';
import ToTokenItem from './ToTokenItem';

const DownArrow = materialCommunityIcon('arrow-down-thin');
const ICON_BUTTON_SIZE = 24;

export interface SwapTokensProps {
  account: Address;
  from: Address;
  setFrom: Dispatch<SetStateAction<Address>>;
  fromAmount: bigint;
  to?: Address;
  setTo: Dispatch<SetStateAction<Address | undefined>>;
}

export function SwapTokens({
  account,
  from,
  setFrom,
  fromAmount,
  to: toParam,
  setTo,
}: SwapTokensProps) {
  const selectToken = useSelectToken();

  const allTokens = useTokens().map((t) => t.address);
  const pools = useSwapPools();

  const pair = toParam ? ([from, toParam].sort(compareAddress) as [Address, Address]) : undefined;
  const pool = pair ? pools.find((p) => deepEqual(p.pair, pair)) : undefined;

  const fromToken = useToken(from);
  const to = pool ? toParam : undefined;

  const selectFrom = async () => {
    const disabled = allTokens.filter((t) => !pools.some((p) => p.pair.includes(t)));

    const token = await selectToken({ account, disabled });
    if (token === to) setTo(from);
    setFrom(token);
  };

  const selectTo = async () => {
    const disabled = allTokens.filter(
      (t) => !pools.some((p) => deepEqual(p.pair, [from, t].sort(compareAddress))),
    );

    const token = await selectToken({ account, disabled: to ? disabled : [from, ...disabled] });
    if (token === from && to) setFrom(to);
    setTo(token);
  };

  return (
    <View>
      <ListItem
        leading={from}
        overline="From"
        headline={useFormattedTokenAmount({ token: fromToken, amount: fromAmount })}
        onPress={selectFrom}
      />

      {to && pool ? (
        <>
          <ToTokenItem
            account={account}
            pool={pool}
            from={{ token: from, amount: fromAmount }}
            onPress={selectTo}
          />

          <IconButton
            mode="contained-tonal"
            size={ICON_BUTTON_SIZE}
            icon={DownArrow}
            style={styles.arrow}
            onPress={() => {
              const prevFrom = from;
              setFrom(to);
              setTo(prevFrom);
            }}
          />
        </>
      ) : (
        <Button mode="contained-tonal" onPress={selectTo} style={styles.selectTokenButton}>
          Select token
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
