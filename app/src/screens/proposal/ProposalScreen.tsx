import { makeStyles } from '@theme/makeStyles';
import { Appbar } from 'react-native-paper';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { ErrorContextProvider } from '~/components/ErrorContextProvider';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { ProposalId } from '~/queries/proposal';
import { useProposal } from '~/queries/proposal/useProposal.api';
import { OnExecute, ProposalActions } from './ProposalActions';
import { ProposalHeader } from './ProposalHeader';
import { ProposalStateCard } from './ProposalStateCard';
import { ProposalTransfers } from './ProposalTransfers';

export interface ProposalScreenParams {
  id: ProposalId;
  onExecute?: OnExecute;
}

export type ProposalScreenProps = RootNavigatorScreenProps<'Proposal'>;

const ProposalScreen = ({ route }: ProposalScreenProps) => {
  const { id, onExecute } = route.params;
  const styles = useStyles();
  const [proposal] = useProposal(id);

  return (
    <ErrorContextProvider>
      <Box flex={1}>
        <Appbar.Header>
          <AppbarBack />
        </Appbar.Header>

        <Container flex={1} separator={<Box mt={4} />}>
          <ProposalHeader proposal={proposal} />
          <ProposalTransfers proposal={proposal} style={styles.mx} />
          <ProposalStateCard proposal={proposal} style={styles.mx} />
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

export default withSkeleton(ProposalScreen, ScreenSkeleton);
