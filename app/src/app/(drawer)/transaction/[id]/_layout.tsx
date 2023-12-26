import { Menu } from 'react-native-paper';
import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { gql } from '@api/generated';
import { NotFound } from '~/components/NotFound';
import { useQuery } from '~/gql';
import { useMutation } from 'urql';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { z } from 'zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { ScrollView } from 'react-native';
import { StyleSheet } from 'react-native';
import { ProposalActions } from '~/components/transaction/ProposalActions';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { useRouter } from 'expo-router';
import { TopTabs } from '~/components/layout/TopTabs';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import { zUuid } from '~/lib/zod';

const Query = gql(/* GraphQL */ `
  query TransactionLayout($proposal: UUID!) {
    transactionProposal(input: { id: $proposal }) {
      id
      account {
        id
        name
      }
      ...ProposalActions_TransactionProposal
    }

    user {
      id
      ...ProposalActions_User
    }
  }
`);

const Remove = gql(/* GraphQL */ `
  mutation TransactionLayout_Remove($proposal: UUID!) {
    removeTransaction(input: { id: $proposal })
  }
`);

export const TransactionLayoutParams = z.object({ id: zUuid() });

export default function TransactionLayout() {
  const { id } = useLocalParams(TransactionLayoutParams);
  const router = useRouter();
  const remove = useMutation(Remove)[1];
  const confirmRemoval = useConfirmRemoval({
    message: 'Are you sure you want to remove this proposal?',
  });

  const query = useQuery(Query, { proposal: id });
  const { transactionProposal: proposal, user } = query.data;

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
                    await remove({ proposal: id });
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
            <TopTabs.Screen name="index" options={{ title: 'Details' }} initialParams={{ id }} />
            <TopTabs.Screen name="policy" options={{ title: 'Policy' }} initialParams={{ id }} />
            <TopTabs.Screen
              name="transaction"
              options={{ title: 'Transaction' }}
              initialParams={{ id }}
            />
          </TopTabs>

          <ProposalActions proposal={proposal} user={user} />
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
