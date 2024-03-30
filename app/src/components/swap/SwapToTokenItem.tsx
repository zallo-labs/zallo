import { FragmentType, gql, useFragment } from '@api';
import Decimal from 'decimal.js';
import { UAddress, asDecimal, asFp } from 'lib';
import { FormattedNumber } from '#/format/FormattedNumber';
import { ListItem } from '#/list/ListItem';
import { ListItemSkeleton } from '#/list/ListItemSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { TokenAmount } from '#/token/TokenAmount';
import { TokenIcon } from '#/token/TokenIcon';
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
  account: UAddress;
  from: FragmentType<typeof FromToken>;
  fromAmount: Decimal;
  to: FragmentType<typeof ToToken>;
  route: SwapRoute;
  selectTo: () => void;
}

function SwapToTokenItem_({
  account,
  fromAmount,
  route,
  selectTo,
  ...props
}: SwapToTokenItemProps) {
  const from = useFragment(FromToken, props.from);
  const to = useFragment(ToToken, props.to);

  const amount = useEstimateSwap({
    account,
    route,
    fromAmount: asFp(fromAmount, from.decimals),
  }).map((amount) => asDecimal(amount, to.decimals));

  const perFrom = useEstimateSwap({
    account,
    route,
    fromAmount: asFp(new Decimal('1'), from.decimals),
  }).map((amount) => asDecimal(amount, to.decimals));

  return (
    <ListItem
      leading={<TokenIcon token={to} />}
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
