import Decimal from 'decimal.js';

import { Chain } from 'chains';
import { asDecimal, asFp } from 'lib';
import { FormattedNumber } from '~/components/format/FormattedNumber';
import { ListItem } from '~/components/list/ListItem';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TokenAmount } from '~/components/token/TokenAmount';
import { TokenIcon } from '~/components/token/TokenIcon';
import { FragmentType, gql, useFragment } from '~/gql/api';
import { SwapRoute } from '~/hooks/swap/useSwapRoute';
import { useEstimateSwap } from '~/util/swap/syncswap/estimate';

const FromToken = gql(/* GraphQL */ `
  fragment SwapToTokenItem_FromToken on Token {
    id
    symbol
    decimals
  }
`);

const ToToken = gql(/* GraphQL */ `
  fragment SwapToTokenItem_ToToken on Token {
    id
    decimals
    ...TokenIcon_Token
    ...TokenAmount_token
  }
`);

export interface SwapToTokenItemProps {
  from: FragmentType<typeof FromToken>;
  fromAmount: Decimal;
  to: FragmentType<typeof ToToken>;
  chain: Chain;
  route: SwapRoute;
  selectTo: () => void;
}

function SwapToTokenItem_({ fromAmount, chain, route, selectTo, ...props }: SwapToTokenItemProps) {
  const from = useFragment(FromToken, props.from);
  const to = useFragment(ToToken, props.to);

  const amount = useEstimateSwap({
    chain,
    route,
    fromAmount: asFp(fromAmount, from.decimals),
  }).map((amount) => asDecimal(amount, to.decimals));

  const perFrom = useEstimateSwap({
    chain,
    route,
    fromAmount: asFp(new Decimal('1'), from.decimals),
  }).map((amount) => asDecimal(amount, to.decimals));

  return (
    <ListItem
      leading={(props) => <TokenIcon {...props} token={to} />}
      leadingSize="medium"
      overline="To (estimated)"
      headline={({ Text }) => (
        <Text>
          {amount.isOk() ? (
            <TokenAmount token={to} amount={amount.value} />
          ) : (
            'Something went wrong'
          )}
        </Text>
      )}
      trailing={({ Text }) => (
        <Text>
          {perFrom.isOk() && (
            <FormattedNumber
              value={perFrom.value}
              maximumFractionDigits={3}
              minimumNumberFractionDigits={4}
              postFormat={(v) => `${v}/${from.symbol}`}
            />
          )}
        </Text>
      )}
      onPress={selectTo}
    />
  );
}

export const SwapToTokenItem = withSuspense(SwapToTokenItem_, <ListItemSkeleton trailing />);
