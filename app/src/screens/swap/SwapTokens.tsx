import { Address } from 'lib';
import { StyleSheet, View } from 'react-native';
import { ListItem } from '~/components/list/ListItem';
import { useFormattedTokenAmount } from '~/components/token/TokenAmount';
import { useSelectToken } from '../tokens/TokensScreen';
import { Button, IconButton } from 'react-native-paper';
import { materialCommunityIcon } from '@theme/icons';
import { Dispatch, SetStateAction } from 'react';
import { ListItemHeight } from '~/components/list/ListItem';
import { Pool } from '~/util/swap';
import ToTokenItem from './ToTokenItem';
import { FragmentType, gql, useFragment } from '@api/generated';
import { TokenIcon } from '~/components/token/TokenIcon';

const DownArrow = materialCommunityIcon('arrow-down-thin');
const ICON_BUTTON_SIZE = 24;

const FromFragment = gql(/* GraphQL */ `
  fragment SwapTokens_fromToken on Token {
    id
    address
    ...TokenIcon_token
    ...UseFormattedTokenAmount_token
    ...ToTokenItem_fromToken
  }
`);

const ToFragment = gql(/* GraphQL */ `
  fragment SwapTokens_toToken on Token {
    id
    address
    ...ToTokenItem_toToken
  }
`);

export interface SwapTokensProps {
  account: Address;
  from: FragmentType<typeof FromFragment>;
  setFromAddress: Dispatch<SetStateAction<Address>>;
  fromAmount: bigint;
  to: FragmentType<typeof ToFragment> | null | undefined;
  setToAddress: Dispatch<SetStateAction<Address | undefined>>;
  pools: Pool[];
  pool?: Pool;
}

export function SwapTokens({
  account,
  setFromAddress,
  fromAmount,
  setToAddress,
  pools,
  pool,
  ...props
}: SwapTokensProps) {
  const from = useFragment(FromFragment, props.from);
  const to = useFragment(ToFragment, props.to);

  const selectToken = useSelectToken();

  const selectFrom = async () => {
    const token = await selectToken({
      account,
      enabled: pools.map((p) => (p.pair[0] === from.address ? p.pair[1] : p.pair[0])),
    });

    if (token === to?.address) setToAddress(from.address);
    setFromAddress(token);
  };

  const selectTo = async () => {
    const enabled = pools.map((p) => (p.pair[0] === from.address ? p.pair[1] : p.pair[0]));

    const token = await selectToken({
      account,
      enabled: pool ? [from.address, ...enabled] : enabled,
    });
    if (token === from.address && to) setFromAddress(to.address);
    setToAddress(token);
  };

  return (
    <View>
      <ListItem
        leading={(props) => <TokenIcon {...props} token={from} />}
        leadingSize="medium"
        overline="From"
        headline={useFormattedTokenAmount({ token: from, amount: fromAmount })}
        onPress={selectFrom}
      />

      {to && pool ? (
        <>
          <ToTokenItem
            account={account}
            pool={pool}
            from={from}
            fromAmount={fromAmount}
            to={to}
            onPress={selectTo}
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
