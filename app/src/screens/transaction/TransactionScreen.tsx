import { Box } from '~/components/layout/Box';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { Suspend } from '~/components/Suspender';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { TxId } from '~/queries/tx';
import { Comments } from './comments/Comments';
import { TransactionStatus } from './status/TransactionStatus';
import { TransactionAppbar } from './appbar/TransactionAppbar';
import { useWallet } from '~/queries/wallets/useWallet';
import { TransactionDetails } from './details/TransactionDetails';
import { useScrolled } from '@hook/useScrolled';
import { Container } from '~/components/layout/Container';
import { useTx } from '~/queries/tx/tx/useTx';

export interface TransactionScreenParams {
  id: TxId;
}

export type TransactionScreenProps = RootNavigatorScreenProps<'Transaction'>;

export const TransactionScreen = withSkeleton(
  ({ route }: TransactionScreenProps) => {
    const { tx } = useTx(route.params.id);
    const wallet = useWallet(tx?.wallet);
    const [scrolled, handleScroll] = useScrolled();

    if (!tx || !wallet) return <Suspend />;

    return (
      <Box flex={1}>
        <TransactionAppbar tx={tx} scrolled={scrolled} />

        <Box flex={1} mx={2}>
          <Comments
            ListHeaderComponent={
              <Container my={3} separator={<Box mt={3} />}>
                <TransactionDetails tx={tx} wallet={wallet} />
                <TransactionStatus tx={tx} wallet={wallet} />
              </Container>
            }
            tx={tx}
            onScroll={handleScroll}
          />
        </Box>
      </Box>
    );
  },
  ScreenSkeleton,
);
