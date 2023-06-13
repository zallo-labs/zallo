import { useToken } from '@token/useToken';
import { Address } from 'lib';
import { formatUnits } from 'viem';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useFormattedTokenAmount } from '~/components/token/TokenAmount';
import { Pool, TokenAmount, useEstimatedSwap } from '~/util/swap';

const RATIO_DECIMALS = 4;
const RATIO_FACTOR = 10n ** BigInt(RATIO_DECIMALS);

export interface ToTokenItemProps extends Partial<ListItemProps> {
  account: Address;
  from: TokenAmount;
  pool: Pool;
}

function ToTokenItem({ account, from, pool, ...itemProps }: ToTokenItemProps) {
  const to = useEstimatedSwap({ account, from, pool });

  const fromToken = useToken(from.token);
  const toToken = useToken(to.token);

  const ratio = from.amount !== 0n ? (to.amount * RATIO_FACTOR) / from.amount : 0n;

  return (
    <ListItem
      leading={to.token}
      overline="To (estimated)"
      headline={useFormattedTokenAmount(to)}
      trailing={`${formatUnits(ratio, toToken.decimals - fromToken.decimals + RATIO_DECIMALS)}/${
        fromToken.symbol
      }`}
      {...itemProps}
    />
  );
}

export default withSuspense(ToTokenItem, () => <ListItemSkeleton leading trailing />);
