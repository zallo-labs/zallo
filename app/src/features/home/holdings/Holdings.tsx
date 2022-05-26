import { SurfaceContainer } from '@components/list/SurfaceContainer';
import { useTokenBalances } from '~/token/useTokenBalances';
import { Holding } from './Holding';

export const Holdings = () => {
  const { balances } = useTokenBalances();

  return (
    <SurfaceContainer>
      {balances.map(({ token }) => (
        <Holding key={token.symbol} token={token} />
      ))}
    </SurfaceContainer>
  );
};
