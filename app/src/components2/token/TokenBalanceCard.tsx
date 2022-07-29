import { withSkeleton } from '@components/skeleton/withSkeleton';
import { Token } from '~/token/token';
import { useTokenBalance } from '~/token/useTokenBalance';
import { CardItemProps } from '../card/CardItem';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { TokenAmountCard } from './TokenAmountCard';

export interface TokenBalanceCardProps extends CardItemProps {
  token: Token;
}

export const TokenBalanceCard = withSkeleton(
  ({ token, ...itemProps }: TokenBalanceCardProps) => {
    const balance = useTokenBalance(token);

    return <TokenAmountCard token={token} amount={balance} {...itemProps} />;
  },
  CardItemSkeleton,
);
