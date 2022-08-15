import { Headline, Subheading } from 'react-native-paper';

import { Box } from '@components/Box';
import { useTokenValues } from '~/token/useTokenValues';
import { FiatValue } from '~/components2/fiat/FiatValue';
import { TokenValue } from '@components/token/TokenValue';
import { ETH } from '~/token/tokens';

export const AccountBalance = () => {
  const { totalFiatValue, totalEthValue } = useTokenValues();

  return (
    <Box vertical alignItems="center">
      <Headline>
        <FiatValue value={totalFiatValue} />
      </Headline>
      <Subheading>
        <TokenValue token={ETH} value={totalEthValue} />
      </Subheading>
    </Box>
  );
};
