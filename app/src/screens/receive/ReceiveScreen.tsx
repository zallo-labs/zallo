import { Box } from '@components/Box';
import { Container } from '@components/list/Container';
import { QrCode } from '@features/qr/QrCode';
import { SelectedAccountCard } from '~/components2/account/SelectedAccountCard';
import { useSelectedAccount } from '~/components2/account/useSelectedAccount';
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

        <Container separator={<Box my={2} />}>
          <TokenCard token={ETH} />
          <SelectedAccountCard large balance={false} />
        </Container>
      </Box>
    </Box>
  );
};
