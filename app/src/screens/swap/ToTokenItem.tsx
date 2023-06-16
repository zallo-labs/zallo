import { convertDecimals } from '@token/token';
import { useToken } from '@token/useToken';
import { Address } from 'lib';
import { useFormattedNumber } from '~/components/format/FormattedNumber';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useFormattedTokenAmount } from '~/components/token/TokenAmount';
import { Pool, TokenAmount, useEstimatedSwap } from '~/util/swap';

const RATIO_DECIMALS = 18;
const RATIO_FACTOR = 10n ** BigInt(RATIO_DECIMALS);

export interface ToTokenItemProps extends Partial<ListItemProps> {
  account: Address;
  from: TokenAmount;
  pool: Pool;
}

function ToTokenItem({ account, from, pool, ...itemProps }: ToTokenItemProps) {
  const to = useEstimatedSwap({ account, pool, from });

  const fromToken = useToken(from.token);
  const toToken = useToken(to.token);

  const ratioFromAmount = from.amount || 10n ** BigInt(fromToken.decimals);
  const { amount: ratioToAmount } = useEstimatedSwap({
    account,
    pool,
    from: { ...from, amount: ratioFromAmount },
  });

  const ratio =
    (ratioToAmount * RATIO_FACTOR) /
    convertDecimals(ratioFromAmount, fromToken.decimals, toToken.decimals);

  return (
    <ListItem
      leading={to.token}
      overline="To (estimated)"
      headline={useFormattedTokenAmount(to)}
      trailing={useFormattedNumber({
        value: ratio,
        decimals: RATIO_DECIMALS,
        maximumFractionDigits: 3,
        minimumNumberFractionDigits: 4,
        postFormat: (v) => `${v}/${fromToken.symbol}`,
      })}
      {...itemProps}
    />
  );
}

export default withSuspense(ToTokenItem, () => <ListItemSkeleton leading trailing />);
