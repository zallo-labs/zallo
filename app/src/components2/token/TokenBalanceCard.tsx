import { withSkeleton } from '@components/skeleton/withSkeleton';
import { Token } from '~/token/token';
import { useTokenBalance } from '~/token/useTokenBalance';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { TokenAmountCard } from './TokenAmountCard';

export interface TokenBalanceCardProps {
  token: Token;
}

export const TokenBalanceCard = withSkeleton(
  ({ token }: TokenBalanceCardProps) => {
    const balance = useTokenBalance(token);

    return <TokenAmountCard token={token} amount={balance} />;
  },
  CardItemSkeleton,
);
