import { FragmentType, gql, useFragment } from '@api/gen';
import { Address, tokenToToken } from 'lib';
import { useFormattedNumber } from '~/components/format/FormattedNumber';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useFormattedTokenAmount } from '~/components/token/TokenAmount';
import { Pool, useEstimatedSwap } from '~/util/swap';

const FromFragment = gql(/* GraphQL */ `
  fragment ToTokenItem_fromToken on Token {
    id
    address
    symbol
    decimals
    ...UseFormattedTokenAmount_token
  }
`);

const ToFragment = gql(/* GraphQL */ `
  fragment ToTokenItem_toToken on Token {
    id
    address
    symbol
    decimals
    ...UseFormattedTokenAmount_token
  }
`);

const RATIO_DECIMALS = 18;
const RATIO_FACTOR = 10n ** BigInt(RATIO_DECIMALS);

export interface ToTokenItemProps extends Partial<ListItemProps> {
  account: Address;
  from: FragmentType<typeof FromFragment>;
  fromAmount: bigint;
  to: FragmentType<typeof ToFragment>;
  pool: Pool;
}

function ToTokenItem({
  account,
  from: fromFragment,
  fromAmount,
  to: toFragment,
  pool,
  ...itemProps
}: ToTokenItemProps) {
  const from = useFragment(FromFragment, fromFragment);
  const to = useFragment(ToFragment, toFragment);

  const { amount: toAmount } = useEstimatedSwap({
    account,
    pool,
    from: { token: from.address, amount: fromAmount },
  });

  const ratioFromAmount = fromAmount || 10n ** BigInt(from.decimals);
  const { amount: ratioToAmount } = useEstimatedSwap({
    account,
    pool,
    from: { token: from.address, amount: ratioFromAmount },
  });
  const ratio =
    (ratioToAmount * RATIO_FACTOR) / tokenToToken(ratioFromAmount, from.decimals, to.decimals);

  return (
    <ListItem
      leading={to.address}
      overline="To (estimated)"
      headline={useFormattedTokenAmount({
        token: to,
        amount: toAmount,
      })}
      trailing={useFormattedNumber({
        value: ratio,
        decimals: RATIO_DECIMALS,
        maximumFractionDigits: 3,
        minimumNumberFractionDigits: 4,
        postFormat: (v) => `${v}/${from.symbol}`,
      })}
      {...itemProps}
    />
  );
}

export default withSuspense(ToTokenItem, () => <ListItemSkeleton leading trailing />);
