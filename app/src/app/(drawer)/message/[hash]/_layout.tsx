import { z } from 'zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { zHash } from '~/lib/zod';
import { gql } from '@api/generated';
import { NotFound } from '~/components/NotFound';
import { useQuery } from '~/gql';
import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { Menu } from 'react-native-paper';
import { useMutation } from 'urql';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { useRouter } from 'expo-router';
import { TopTabs } from '~/components/layout/TopTabs';
import { MessageProposalActions } from '~/components/proposal/MessageProposalActions';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { StyleSheet, ScrollView } from 'react-native';
import { ScreenSurface } from '~/components/layout/ScreenSurface';

const Query = gql(/* GraphQL */ `
  query MessageLayout($proposal: Bytes32!) {
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
  mutation MessageLayout_Remove($proposal: Bytes32!) {
    removeMessage(input: { hash: $proposal })
  }
`);

export const MessageLayoutParams = z.object({ hash: zHash });
export type MessageLayoutParams = z.infer<typeof MessageLayoutParams>;

export default function MessageLayout() {
  const params = useLocalParams(MessageLayoutParams);
  const router = useRouter();
  const remove = useMutation(Remove)[1];
  const confirmRemoval = useConfirmRemoval({
    message: 'Are you sure you want to remove this proposal?',
  });

  const query = useQuery(Query, { proposal: params.hash });
  const proposal = query.data?.messageProposal;

  if (!proposal) return query.stale ? null : <NotFound name="Proposal" />;

  return (
    <>
      <AppbarOptions
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
                    router.back();
                  }
                }}
              />
            )}
          </AppbarMore>
        )}
      />

      <ScreenSurface>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <TopTabs>
            <TopTabs.Screen
              name="index"
              options={{ title: 'Details' }}
              initialParams={{ hash: params.hash }}
            />
            <TopTabs.Screen
              name="policy"
              options={{ title: 'Policy' }}
              initialParams={{ hash: params.hash }}
            />
          </TopTabs>

          <MessageProposalActions proposal={proposal} user={query.data.user} />
        </ScrollView>
      </ScreenSurface>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
