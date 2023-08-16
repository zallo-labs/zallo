import { Menu } from 'react-native-paper';
import { Appbar } from '~/components/Appbar/Appbar';
import { AppbarMore2 } from '~/components/Appbar/AppbarMore';
import { Screen } from '~/components/layout/Screen';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useConfirmRemoval } from '../alert/useConfirm';
import { Tabs } from './Tabs';
import { ProposalActions } from './ProposalActions';
import { Hex } from 'lib';
import { gql } from '@api/generated';
import { NotFound } from '~/components/NotFound';
import { useQuery } from '~/gql';
import { useMutation } from 'urql';
import { Suspend } from '~/components/Suspender';

const Query = gql(/* GraphQL */ `
  query ProposalScreen($proposal: Bytes32!) {
    transactionProposal(input: { hash: $proposal }) {
      id
      hash
      account {
        id
        name
      }
      ...ProposalActions_TransactionProposalFragment
    }

    user {
      id
      ...ProposalActions_User
    }
  }
`);

const Remove = gql(/* GraphQL */ `
  mutation ProposalScreen_Remove($proposal: Bytes32!) {
    removeTransactionProposal(input: { hash: $proposal })
  }
`);

export interface ProposalScreenParams {
  proposal: Hex;
}

export type ProposalScreenProps = StackNavigatorScreenProps<'Proposal'>;

export const ProposalScreen = withSuspense(
  ({ route, navigation: { goBack } }: ProposalScreenProps) => {
    const query = useQuery(Query, { proposal: route.params.proposal });
    const { transactionProposal: proposal, user } = query.data;

    const remove = useMutation(Remove)[1];
    const confirmRemoval = useConfirmRemoval({
      message: 'Are you sure you want to remove this proposal?',
    });

    if (!proposal) return query.stale ? <Suspend /> : <NotFound name="Proposal" />;

    return (
      <Screen>
        <Appbar
          mode="small"
          leading="back"
          headline={proposal.account.name}
          trailing={(props) => (
            <AppbarMore2 iconProps={props}>
              {({ close }) => (
                <Menu.Item
                  title="Remove proposal"
                  onPress={async () => {
                    close();
                    if (await confirmRemoval()) {
                      await remove({ proposal: proposal.hash });
                      goBack();
                    }
                  }}
                />
              )}
            </AppbarMore2>
          )}
        />

        <Tabs proposal={proposal.hash} />

        <ProposalActions proposal={proposal} user={user} />
      </Screen>
    );
  },
  ScreenSkeleton,
);
