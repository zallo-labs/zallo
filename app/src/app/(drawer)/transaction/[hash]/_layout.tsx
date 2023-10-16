import { Menu } from 'react-native-paper';
import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { gql } from '@api/generated';
import { NotFound } from '~/components/NotFound';
import { useQuery } from '~/gql';
import { useMutation } from 'urql';
import { Suspend } from '~/components/Suspender';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { z } from 'zod';
import { isHash } from 'viem';
import { useLocalParams } from '~/hooks/useLocalParams';
import { ScrollView } from 'react-native';
import { StyleSheet } from 'react-native';
import { ProposalActions } from '~/components/transaction/ProposalActions';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { useRouter } from 'expo-router';
import { TopTabs } from '~/components/TopTabs';

const Query = gql(/* GraphQL */ `
  query TransactionLayout($hash: Bytes32!) {
    transactionProposal(input: { hash: $hash }) {
      id
      hash
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
  mutation TransactionLayout_Remove($proposal: Bytes32!) {
    removeTransaction(input: { hash: $proposal })
  }
`);

export const TransactionLayoutParams = z.object({ hash: z.string().refine(isHash) });

export default function TransactionLayout() {
  const { hash } = useLocalParams(`/(drawer)/transaction/[hash]/`, TransactionLayoutParams);
  const router = useRouter();
  const remove = useMutation(Remove)[1];
  const confirmRemoval = useConfirmRemoval({
    message: 'Are you sure you want to remove this proposal?',
  });

  const query = useQuery(Query, { hash });
  const { transactionProposal: proposal, user } = query.data;

  if (!proposal) return query.stale ? <Suspend /> : <NotFound name="Proposal" />;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
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

      <TopTabs>
        <TopTabs.Screen name="index" options={{ title: 'Details' }} initialParams={{ hash }} />
        <TopTabs.Screen name="policy" options={{ title: 'Policy' }} initialParams={{ hash }} />
        <TopTabs.Screen
          name="transaction"
          options={{ title: 'Transaction' }}
          initialParams={{ hash }}
        />
      </TopTabs>

      <ProposalActions proposal={proposal} user={user} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
