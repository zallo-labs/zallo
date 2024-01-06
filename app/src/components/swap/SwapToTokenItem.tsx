import { FragmentType, gql, useFragment } from '@api';
import { Chain } from 'chains';
import Decimal from 'decimal.js';
import { asDecimal, asFp } from 'lib';
import { FormattedNumber } from '~/components/format/FormattedNumber';
import { ListItem } from '~/components/list/ListItem';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TokenAmount } from '~/components/token/TokenAmount';
import { TokenIcon } from '~/components/token/TokenIcon';
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

  const toAmountEstimate = useEstimateSwap({
    chain,
    route,
    fromAmount: asFp(fromAmount, from.decimals),
  });

  if (toAmountEstimate === undefined) return null;

  return (
    <ListItem
      leading={(props) => <TokenIcon {...props} token={to} />}
      leadingSize="medium"
      overline="To (estimated)"
      headline={({ Text }) => (
        <Text>
          <TokenAmount token={to} amount={asDecimal(toAmountEstimate!, to.decimals)} />
        </Text>
      )}
      trailing={({ Text }) => (
        <Text>
          <FormattedNumber
            value={0}
            maximumFractionDigits={3}
            minimumNumberFractionDigits={4}
            postFormat={(v) => `${v}/${from.symbol}`}
          />
        </Text>
      )}
      onPress={selectTo}
    />
  );
}

export const SwapToTokenItem = withSuspense(SwapToTokenItem_, <ListItemSkeleton trailing />);
