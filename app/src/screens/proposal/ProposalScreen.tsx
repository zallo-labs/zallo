import { makeStyles } from '@theme/makeStyles';
import { ErrorContextProvider } from '~/components/ErrorContextProvider';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { ProposalId, useProposal } from '@api/proposal';
import { OnExecute, ProposalActions } from './ProposalActions';
import { ProposalHeader } from './ProposalHeader';
import { StateCard } from './StateCard/StateCard';
import { ProposalTransfers } from './ProposalTransfers';
import { ProposalAppbar } from './ProposalAppbar';

export interface ProposalScreenParams {
  proposal: ProposalId;
  onExecute?: OnExecute;
}

export type ProposalScreenProps = StackNavigatorScreenProps<'Proposal'>;

const ProposalScreen = ({ route: { params } }: ProposalScreenProps) => {
  const { onExecute } = params;
  const styles = useStyles();
  const proposal = useProposal(params.proposal);

  return (
    <ErrorContextProvider>
      <Box flex={1}>
        <ProposalAppbar proposal={proposal.id} />

        <Container flex={1} separator={<Box mt={4} />}>
          <ProposalHeader proposal={proposal} />
          <ProposalTransfers proposal={proposal} style={styles.mx} />
          <StateCard proposal={proposal} style={styles.mx} />
          <ProposalActions proposal={proposal} onExecute={onExecute} />
        </Container>
      </Box>
    </ErrorContextProvider>
  );
};

const useStyles = makeStyles(({ space }) => ({
  mx: {
    marginHorizontal: space(2),
  },
}));

export default withSuspense(ProposalScreen, ScreenSkeleton);
