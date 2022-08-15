import { AppbarBack } from '@components/AppbarBack';
import { Box } from '@components/Box';
import { ScreenSkeleton } from '@components/skeleton/ScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { Suspend } from '@components/Suspender';
import { Appbar } from 'react-native-paper';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { CallCard } from '~/components2/call/CallCard';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { ProposedTx, TxId } from '~/queries/tx';
import { useTx } from '~/queries/tx/useTx';

export interface TransactionScreenParams {
  id: TxId;
  onPropose?: (tx: ProposedTx) => void;
}

export type TransactionScreenProps = RootNavigatorScreenProps<'Transaction'>;

export const TransactionScreen = withSkeleton(
  ({ route }: TransactionScreenProps) => {
    const id = route.params.id;
    const { tx, loading } = useTx(id);
    const { AppbarHeader, handleScroll } = useAppbarHeader();

    if (!tx || loading) return <Suspend />;

    return (
      <Box>
        <AppbarHeader>
          <AppbarBack />
          <Appbar.Content title="Transaction" />
        </AppbarHeader>

        <Box mx={2}>
          <CallCard id={id} variant="full" />
        </Box>
      </Box>
    );
  },
  ScreenSkeleton,
);
