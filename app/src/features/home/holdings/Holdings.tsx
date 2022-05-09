import { ItemsContainer } from '@components/list/ItemsContainer';
import { useTokenBalances } from '~/token/useTokenBalances';
import { Holding } from './Holding';

export const Holdings = () => {
  const { balances } = useTokenBalances();

  return (
    <ItemsContainer>
      {balances.map(({ token }) => (
        <Holding key={token.symbol} token={token} />
      ))}
    </ItemsContainer>
  );
};
