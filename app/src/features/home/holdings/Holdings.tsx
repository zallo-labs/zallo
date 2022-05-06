import { Box } from '@components/Box';
import { Divider } from '@components/Divider';
import { ItemsContainer } from '@components/ItemsContainer';
import { TOKENS } from '~/token/tokens';
import { useTokenBalances } from '~/token/useTokenBalances';
import { Holding } from './Holding';

const space = 3;

export const Holdings = () => {
  const { balances } = useTokenBalances();

  return (
    <ItemsContainer>
      {balances.map(({ token }, i) => (
        <Box key={token.symbol} mt={i > 0 ? space : 0}>
          <Holding token={token} />

          {i < TOKENS.length - 1 && (
            <Box mt={space}>
              <Divider />
            </Box>
          )}
        </Box>
      ))}
    </ItemsContainer>
  );
};
