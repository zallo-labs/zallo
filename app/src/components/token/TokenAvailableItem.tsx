import { useTokenAvailable } from '@token/useTokenAvailable';
import { UserId } from 'lib';
import TokenItem, { TokenItemProps } from './TokenItem';

export interface TokenAvailableItemProps extends Omit<TokenItemProps, 'amount'> {
  user: UserId;
}

export const TokenAvailableItem = ({ token, user, ...itemProps }: TokenAvailableItemProps) => {
  return <TokenItem {...itemProps} token={token} amount={useTokenAvailable(token, user)} />;
};
