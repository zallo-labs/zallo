import { useTokenAvailable } from '@token/useTokenAvailable';
import { QuorumGuid } from 'lib';
import TokenItem, { TokenItemProps } from './TokenItem';

export interface TokenAvailableItemProps extends Omit<TokenItemProps, 'amount'> {
  quorum: QuorumGuid;
}

export const TokenAvailableItem = ({
  token,
  quorum: user,
  ...itemProps
}: TokenAvailableItemProps) => {
  return <TokenItem {...itemProps} token={token} amount={useTokenAvailable(token, user)} />;
};
