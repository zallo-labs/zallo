import { AppbarBack } from '@components/AppbarBack';
import { Box } from '@components/Box';
import { Container } from '@components/list/Container';
import { ScreenSkeleton } from '@components/skeleton/ScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { Suspend } from '@components/Suspender';
import { Appbar } from 'react-native-paper';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { CallCard } from '~/components2/call/CallCard';
import { useSelectedWallet } from '~/components2/wallet/useSelectedWallet';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { ProposedTx, TxId } from '~/queries/tx';
import { useTx } from '~/queries/tx/useTx';
import { TransactionStatus } from './status/TransactionStatus';

export interface TransactionScreenParams {
  id: TxId;
  onPropose?: (tx: ProposedTx) => void;
}

export type TransactionScreenProps = RootNavigatorScreenProps<'Transaction'>;

export const TransactionScreen = withSkeleton(
  ({ route }: TransactionScreenProps) => {
    const id = route.params.id;
    const { tx } = useTx(id);
    const { AppbarHeader, handleScroll } = useAppbarHeader();
    const wallet = useSelectedWallet(); // TODO: associate a wallet & quorum with a tx

    if (!tx || !wallet) return <Suspend />;

    return (
      <Box>
        <AppbarHeader>
          <AppbarBack />
          <Appbar.Content title="Transaction" />
        </AppbarHeader>

        <Container mx={2} separator={<Box my={2} />}>
          <CallCard id={id} variant="full" />

          <TransactionStatus tx={tx} wallet={wallet} />
        </Container>
      </Box>
    );
  },
  ScreenSkeleton,
);
