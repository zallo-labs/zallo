import { Box } from '@components/Box';
import { Container } from '@components/list/Container';
import { useTokenValues } from '~/token/useTokenValues';
import { Holding } from './Holding';

export const Holdings = () => {
  const { balances } = useTokenValues();

  return (
    <Box surface rounded px={2} py={3}>
      <Container separator={<Box my={2} />}>
        {balances.map((token) => (
          <Holding key={token.symbol} token={token} />
        ))}
      </Container>
    </Box>
  );
};
