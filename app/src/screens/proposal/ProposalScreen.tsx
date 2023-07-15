import { useRemoveProposal } from '@api/proposal';
import { Menu, Text } from 'react-native-paper';
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
import { gql } from '@api/gen';
import { useSuspenseQuery } from '@apollo/client';
import { ProposalQuery, ProposalQueryVariables } from '@api/gen/graphql';

const ProposalQueryDoc = gql(/* GraphQL */ `
  query Proposal($proposal: Bytes32!) {
    proposal(input: { hash: $proposal }) {
      id
      hash
      account {
        id
        name
      }
      ...ProposalActions_TransactionProposalFragment @arguments(proposal: $proposal)
    }
  }
`);

export interface ProposalScreenParams {
  proposal: Hex;
}

export type ProposalScreenProps = StackNavigatorScreenProps<'Proposal'>;

export const ProposalScreen = withSuspense(
  ({ route, navigation: { goBack } }: ProposalScreenProps) => {
    const p = useSuspenseQuery<ProposalQuery, ProposalQueryVariables>(ProposalQueryDoc, {
      variables: { proposal: route.params.proposal },
    }).data.proposal;

    const removeProposal = useRemoveProposal();
    const confirmRemoval = useConfirmRemoval({
      message: 'Are you sure you want to remove this proposal?',
    });

    if (!p) return <Text>Proposal not found</Text>; // TODO: not found page

    return (
      <Screen>
        <Appbar
          mode="small"
          leading="back"
          headline={p.account.name}
          trailing={(props) => (
            <AppbarMore2 iconProps={props}>
              {({ close }) => (
                <Menu.Item
                  title="Remove proposal"
                  onPress={async () => {
                    close();
                    if (await confirmRemoval()) {
                      await removeProposal(p);
                      goBack();
                    }
                  }}
                />
              )}
            </AppbarMore2>
          )}
        />

        <Tabs proposal={p.hash} />

        <ProposalActions proposal={p} />
      </Screen>
    );
  },
  ScreenSkeleton,
);
