import { z } from 'zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { zUuid } from '~/lib/zod';
import { gql } from '@api/generated';
import { NotFound } from '~/components/NotFound';
import { useQuery } from '~/gql';
import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { Menu, Text } from 'react-native-paper';
import { useMutation } from 'urql';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { useRouter } from 'expo-router';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { ScrollableScreenSurface } from '~/components/layout/ScrollableScreenSurface';
import { MessageStatus } from '~/components/message/MessageStatus';
import { StyleSheet, View } from 'react-native';
import { MessageIcon } from '~/components/message/MessageIcon';
import { DataView } from '~/components/DataView/DataView';
import { RiskRating } from '~/components/proposal/RiskRating';
import { MessageActions } from '~/components/message/MessageActions';
import { asChain } from 'lib';
import { SideSheetLayout } from '~/components/SideSheet/SideSheetLayout';
import { SideSheet } from '~/components/SideSheet/SideSheet';
import { useSideSheetVisibility } from '~/components/SideSheet/useSideSheetVisibility';
import { ProposalApprovals } from '~/components/policy/ProposalApprovals';

const Query = gql(/* GraphQL */ `
  query MessageScreen($proposal: UUID!) {
    messageProposal(input: { id: $proposal }) {
      id
      label
      message
      typedData
      account {
        id
        address
        name
      }
      ...MessageStatus_MessageProposal
      ...MessageIcon_MessageProposal
      ...RiskRating_Proposal
      ...MessageActions_MessageProposal
    }

    user {
      id
      ...MessageActions_User
    }
  }
`);

const Remove = gql(/* GraphQL */ `
  mutation MessageScreen_Remove($proposal: UUID!) {
    removeMessage(input: { id: $proposal })
  }
`);

const MessageScreenParams = z.object({ id: zUuid() });

export default function MessageScreen() {
  const { id } = useLocalParams(MessageScreenParams);
  const router = useRouter();
  const remove = useMutation(Remove)[1];
  const confirmRemoval = useConfirmRemoval({
    message: 'Are you sure you want to remove this proposal?',
  });
  const sideSheet = useSideSheetVisibility();

  const query = useQuery(Query, { proposal: id });
  const p = query.data?.messageProposal;

  if (!p) return query.stale ? null : <NotFound name="Proposal" />;

  return (
    <SideSheetLayout>
      <AppbarOptions
        headline={p.account.name}
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

      <ScrollableScreenSurface>
        <MessageStatus proposal={p} />

        <View style={styles.header}>
          <MessageIcon proposal={p} />
          <Text>
            <Text variant="titleMedium">{p.label || 'Message'}</Text>
          </Text>
        </View>

        <DataView chain={asChain(p.account.address)}>{p.typedData ?? p.message}</DataView>

        <RiskRating proposal={p} />

        <MessageActions proposal={p} user={query.data.user} />
      </ScrollableScreenSurface>

      <SideSheet headline="Approvals" {...sideSheet}>
        <ProposalApprovals proposal={id} />
      </SideSheet>
    </SideSheetLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 16,
    marginHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
});
