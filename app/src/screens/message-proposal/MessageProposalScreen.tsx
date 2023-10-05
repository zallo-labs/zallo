import { gql } from '@api/generated';
import { Hex } from 'lib';
import { Appbar } from '~/components/Appbar/Appbar';
import { NotFound } from '~/components/NotFound';
import { Suspend } from '~/components/Suspender';
import { Screen } from '~/components/layout/Screen';
import { useQuery } from '~/gql';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Tabs } from './Tabs';
import { MessageProposalActions } from './MessageProposalActions';
import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { Menu } from 'react-native-paper';
import { useMutation } from 'urql';
import { useConfirmRemoval } from '../alert/useConfirm';

const Query = gql(/* GraphQL */ `
  query MessageProposalScreen($proposal: Bytes32!) {
    messageProposal(input: { hash: $proposal }) {
      id
      hash
      account {
        id
        name
      }
      ...MessageProposalActions_MessageProposal
    }

    user {
      id
      ...MessageProposalActions_User
    }
  }
`);

const Remove = gql(/* GraphQL */ `
  mutation MessageProposalScreen_Remove($proposal: Bytes32!) {
    removeMessage(input: { hash: $proposal })
  }
`);

export interface MessageProposalScreenParams {
  proposal: Hex;
}

export type MessageProposalScreenProps = StackNavigatorScreenProps<'MessageProposal'>;

export function MessageProposalScreen({
  route,
  navigation: { goBack },
}: MessageProposalScreenProps) {
  const query = useQuery(Query, { proposal: route.params.proposal });
  const proposal = query.data?.messageProposal;

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
          <AppbarMore iconProps={props}>
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
          </AppbarMore>
        )}
      />

      <Tabs proposal={proposal.hash} />

      <MessageProposalActions proposal={proposal} user={query.data.user} />
    </Screen>
  );
}
