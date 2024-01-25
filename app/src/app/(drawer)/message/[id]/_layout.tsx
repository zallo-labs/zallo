import { z } from 'zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { zUuid } from '~/lib/zod';
import { gql } from '@api/generated';
import { NotFound } from '~/components/NotFound';
import { useQuery } from '~/gql';
import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { Menu } from 'react-native-paper';
import { useMutation } from 'urql';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { useRouter } from 'expo-router';
import { TopTabs } from '~/components/layout/TopTabs';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import { MessageStatus } from '~/components/message/MessageStatus';

const Query = gql(/* GraphQL */ `
  query MessageLayout($proposal: UUID!) {
    messageProposal(input: { id: $proposal }) {
      id
      account {
        id
        name
      }
      ...MessageStatus_MessageProposal
    }
  }
`);

const Remove = gql(/* GraphQL */ `
  mutation MessageLayout_Remove($proposal: UUID!) {
    removeMessage(input: { id: $proposal })
  }
`);

export const MessageLayoutParams = z.object({ id: zUuid() });
export type MessageLayoutParams = z.infer<typeof MessageLayoutParams>;

export default function MessageLayout() {
  const { id } = useLocalParams(MessageLayoutParams);
  const router = useRouter();
  const remove = useMutation(Remove)[1];
  const confirmRemoval = useConfirmRemoval({
    message: 'Are you sure you want to remove this proposal?',
  });

  const query = useQuery(Query, { proposal: id });
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
                    await remove({ proposal: id });
                    router.back();
                  }
                }}
              />
            )}
          </AppbarMore>
        )}
      />

      <ScreenSurface scrollEnabled={false}>
        <MessageStatus proposal={proposal} />

        <TopTabs>
          <TopTabs.Screen name="index" options={{ title: 'Message' }} initialParams={{ id }} />
          <TopTabs.Screen name="approval" options={{ title: 'Approval' }} initialParams={{ id }} />
        </TopTabs>
      </ScreenSurface>
    </>
  );
}
