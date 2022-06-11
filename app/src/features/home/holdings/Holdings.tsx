import { Box } from '@components/Box';
import { SurfaceContainer } from '@components/list/SurfaceContainer';
import { useTokenBalances } from '~/token/useTokenBalances';
import { Holding } from './Holding';

export const Holdings = () => {
  const { balances } = useTokenBalances();

  return (
    <SurfaceContainer separator={<Box my={2} />}>
      {balances.map(({ token }) => (
        <Holding key={token.symbol} token={token} />
      ))}
    </SurfaceContainer>
  );
};
