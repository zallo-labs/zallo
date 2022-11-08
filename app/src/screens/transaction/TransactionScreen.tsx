import { Box } from '~/components/layout/Box';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { Comments } from './comments/Comments';
import { TransactionStatus } from './status/TransactionStatus';
import { TransactionAppbar } from './appbar/TransactionAppbar';
import { TransactionDetails } from './details/TransactionDetails';
import { useScrolled } from '@hook/useScrolled';
import { Container } from '~/components/layout/Container';
import { PotentialDisabledExecutionWarning } from './status/PotentialDisabledExecutionWarning';
import {
  TransactionContextProps,
  TransactionProvider,
} from './TransactionProvider';

export interface TransactionScreenParams
  extends Omit<TransactionContextProps, 'children'> {}

export type TransactionScreenProps = RootNavigatorScreenProps<'Proposal'>;

export const TransactionScreen = withSkeleton(
  ({ route }: TransactionScreenProps) => {
    const [scrolled, handleScroll] = useScrolled();

    return (
      <TransactionProvider {...route.params}>
        <Box flex={1}>
          <TransactionAppbar scrolled={scrolled} />

          <Box flex={1} mx={2}>
            <Comments
              ListHeaderComponent={
                <Container my={1} separator={<Box mt={1} />}>
                  <PotentialDisabledExecutionWarning />
                  <TransactionDetails />
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
