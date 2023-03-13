import { useTokenAvailable } from '@token/useTokenAvailable';
import { AccountIdlike } from '@api/account';
import TokenItem, { TokenItemProps } from './TokenItem';

export interface TokenAvailableItemProps extends Omit<TokenItemProps, 'amount'> {
  account: AccountIdlike;
}

export const TokenAvailableItem = ({
  token,
  account: user,
  ...itemProps
}: TokenAvailableItemProps) => {
  return <TokenItem {...itemProps} token={token} amount={useTokenAvailable(token, user)} />;
};
