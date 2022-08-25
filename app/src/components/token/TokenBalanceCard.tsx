import { ZERO } from 'lib';
import { Token } from '@token/token';
import { ETH } from '@token/tokens';
import { CardItemProps } from '../card/CardItem';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { TokenAmountCard } from './TokenAmountCard';
import { withSkeleton } from '../skeleton/withSkeleton';
import { useTokenBalance } from '@token/useTokenBalance';
import { WalletId } from '~/queries/wallets';

export interface TokenBalanceCardProps extends CardItemProps {
  token: Token;
  wallet: WalletId;
  showZero?: boolean;
}

export const TokenBalanceCard = withSkeleton(
  ({ token, wallet, showZero = true, ...itemProps }: TokenBalanceCardProps) => {
    const balance = useTokenBalance(token, wallet);

    if (!showZero && balance.eq(ZERO) && token !== ETH) return null;

    return <TokenAmountCard token={token} amount={balance} {...itemProps} />;
  },
  CardItemSkeleton,
);
