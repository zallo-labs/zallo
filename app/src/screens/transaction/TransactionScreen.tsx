import { ScreenSkeleton } from '@components/skeleton/ScreenSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { Suspend } from '@components/Suspender';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { TxId } from '~/queries/tx';
import { useTx } from '~/queries/tx/useTx';

export interface TransactionScreenParams {
  id: TxId;
}

export type TransactionScreenProps = RootNavigatorScreenProps<'Transaction'>;

export const TransactionScreen = withSkeleton(
  ({ route }: TransactionScreenProps) => {
    const { tx, loading } = useTx(route.params.id);

    if (!tx || loading) return <Suspend />;

    return null;
  },
  ScreenSkeleton,
);
