import { RemoveIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Appbar, Menu } from 'react-native-paper';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { ErrorContextProvider } from '~/components/ErrorContextProvider';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { useRemoveProposal } from '~/mutations/proposal/useRemoveProposal.api';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { ProposalId } from '~/queries/proposal';
import { useProposal } from '~/queries/proposal/useProposal.api';
import { useConfirmRemoval } from '../alert/useConfirm';
import { OnExecute, ProposalActions } from './ProposalActions';
import { ProposalHeader } from './ProposalHeader';
import { ProposalStateCard } from './ProposalStateCard';
import { ProposalTransfers } from './ProposalTransfers';

export interface ProposalScreenParams {
  proposal: ProposalId;
  onExecute?: OnExecute;
}

export type ProposalScreenProps = StackNavigatorScreenProps<'Proposal'>;

const ProposalScreen = ({ route: { params }, navigation: { goBack } }: ProposalScreenProps) => {
  const { onExecute } = params;
  const styles = useStyles();
  const proposal = useProposal(params.proposal);
  const removeProposal = useRemoveProposal();
  const confirmRemove = useConfirmRemoval({
    message: 'Are you sure you want to remove this proposal?',
  });

  return (
    <ErrorContextProvider>
      <Box flex={1}>
        <Appbar.Header>
          <AppbarBack />
          <Appbar.Content title="" />
          <AppbarMore>
            {({ close }) => (
              <Menu.Item
                leadingIcon={RemoveIcon}
                title="Remove proposal"
                onPress={() => {
                  confirmRemove({
                    onConfirm: () => {
                      removeProposal(proposal);
                      goBack();
                    },
                  });
                  close();
                }}
              />
            )}
          </AppbarMore>
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
