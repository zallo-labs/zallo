import { Box } from '~/components/layout/Box';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { TxId } from '~/queries/tx';
import { Comments } from './comments/Comments';
import { TransactionStatus } from './status/TransactionStatus';
import { TransactionAppbar } from './appbar/TransactionAppbar';
import { TransactionDetails } from './details/TransactionDetails';
import { useScrolled } from '@hook/useScrolled';
import { Container } from '~/components/layout/Container';
import { PotentialDisabledExecutionWarning } from './status/PotentialDisabledExecutionWarning';
import { TransactionProvider } from './TransactionProvider';

export interface TransactionScreenParams {
  id: TxId;
}

export type TransactionScreenProps = RootNavigatorScreenProps<'Transaction'>;

export const TransactionScreen = withSkeleton(
  ({ route }: TransactionScreenProps) => {
    const [scrolled, handleScroll] = useScrolled();

    return (
      <TransactionProvider id={route.params.id}>
        <Box flex={1}>
          <TransactionAppbar scrolled={scrolled} />

          <Box flex={1} mx={2}>
            <Comments
              ListHeaderComponent={
                <Container my={3} separator={<Box mt={3} />}>
                  <TransactionDetails />
                  <PotentialDisabledExecutionWarning />
                  <TransactionStatus />
                </Container>
              }
              onScroll={handleScroll}
            />
          </Box>
        </Box>
      </TransactionProvider>
    );
  },
  ScreenSkeleton,
);
