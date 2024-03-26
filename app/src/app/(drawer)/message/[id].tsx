import { z } from 'zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { zUuid } from '~/lib/zod';
import { gql } from '@api/generated';
import { NotFound } from '#/NotFound';
import { useQuery } from '~/gql';
import { AppbarMore } from '#/Appbar/AppbarMore';
import { Divider, Menu } from 'react-native-paper';
import { AppbarOptions } from '#/Appbar/AppbarOptions';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import { MessageStatus } from '#/message/MessageStatus';
import { StyleSheet, View } from 'react-native';
import { DataView } from '#/DataView/DataView';
import { MessageActions } from '#/message/MessageActions';
import { SideSheetLayout } from '#/SideSheet/SideSheetLayout';
import { SideSheet } from '#/SideSheet/SideSheet';
import { ProposalApprovals } from '#/policy/ProposalApprovals';
import { ListHeader } from '#/list/ListHeader';
import { DappHeader } from '#/walletconnect/DappHeader';
import { AccountSection } from '#/proposal/AccountSection';
import { useRemoveMessage } from '#/message/useRemoveMessage';

const Query = gql(/* GraphQL */ `
  query MessageScreen($proposal: ID!) {
    message(input: { id: $proposal }) {
      id
      label
      message
      typedData
      account {
        id
        chain
        ...AccountSection_Account
      }
      dapp {
        ...DappHeader_DappMetadata
      }
      ...useRemoveMessage_Message
      ...MessageStatus_Message
      ...MessageActions_Message
    }

    user {
      id
      ...MessageActions_User
    }
  }
`);

const MessageScreenParams = z.object({ id: zUuid() });

export default function MessageScreen() {
  const { id } = useLocalParams(MessageScreenParams);

  const query = useQuery(Query, { proposal: id });
  const p = query.data?.message;

  const remove = useRemoveMessage(p);

  if (!p) return query.stale ? null : <NotFound name="Message" />;

  return (
    <SideSheetLayout>
      <AppbarOptions
        headline={(props) => <MessageStatus proposal={p} {...props} />}
        mode="large"
        {...(remove && {
          trailing: (props) => (
            <AppbarMore iconProps={props}>
              {({ handle }) => <Menu.Item title="Remove" onPress={handle(remove)} />}
            </AppbarMore>
          ),
        })}
      />

      <ScrollableScreenSurface contentContainerStyle={styles.sheet}>
        {p.dapp && <DappHeader dapp={p.dapp} action="wants you to sign" />}

        <AccountSection account={p.account} />
        <Divider horizontalInset style={styles.divider} />

        <View style={styles.messageContainer}>
          <ListHeader>Message</ListHeader>
          <DataView chain={p.account.chain} style={styles.messageData}>
            {p.typedData ?? p.message}
          </DataView>
        </View>

        <MessageActions proposal={p} user={query.data.user} />
      </ScrollableScreenSurface>

      <SideSheet headline="Approvals">
        <ProposalApprovals proposal={id} />
      </SideSheet>
    </SideSheetLayout>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 8,
  },
  messageContainer: {
    gap: 8,
  },
  messageData: {
    marginHorizontal: 16,
  },
});

export { ErrorBoundary } from '#/ErrorBoundary';
