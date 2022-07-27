import { Box } from '@components/Box';
import { Container } from '@components/list/Container';
import { QrCode } from '@features/qr/QrCode';
import { AccountCard } from '~/components2/AccountCard/AccountCard';
import { useSelectedAccount } from '~/components2/AccountCard/useSelectedAccount';
import { TokenCard } from '~/components2/token/TokenCard';
import { ETH } from '~/token/tokens';
import { ReceiveAppbar } from './ReceiveAppbar';

export const ReceiveScreen = () => {
  const { safe } = useSelectedAccount();

  return (
    <Box flex={1}>
      <ReceiveAppbar />

      <Box flex={1} justifyContent="space-around" mx={4} my={3}>
        <QrCode addr={safe.safe.address} />

        <Container separator={<Box my={3} />}>
          <TokenCard token={ETH} />
          <AccountCard />
        </Container>
      </Box>
    </Box>
  );
};
