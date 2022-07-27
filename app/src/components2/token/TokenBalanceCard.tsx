import { Token } from '~/token/token';
import { useTokenBalance } from '~/token/useTokenBalance';
import { TokenAmountCard } from './TokenAmountCard';

export interface TokenBalanceCardProps {
  token: Token;
}

export const TokenBalanceCard = ({ token }: TokenBalanceCardProps) => {
  const balance = useTokenBalance(token);

  return <TokenAmountCard token={token} amount={balance} />;
};
