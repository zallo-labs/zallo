import { ZERO } from 'lib';
import { Token } from '@token/token';
import { ETH } from '@token/tokens';
import { CardItemProps } from '../card/CardItem';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { TokenAmountCard } from './TokenAmountCard';
import { withSkeleton } from '../skeleton/withSkeleton';
import { useTokenBalance } from '@token/useTokenBalance';

export interface TokenBalanceCardProps extends CardItemProps {
  token: Token;
  showZero?: boolean;
}

export const TokenBalanceCard = withSkeleton(
  ({ token, showZero = true, ...itemProps }: TokenBalanceCardProps) => {
    const balance = useTokenBalance(token);

    if (!showZero && balance.eq(ZERO) && token !== ETH) return null;

    return <TokenAmountCard token={token} amount={balance} {...itemProps} />;
  },
  CardItemSkeleton,
);
