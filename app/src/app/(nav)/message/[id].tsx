import { z } from 'zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { zUuid } from '~/lib/zod';
import { AppbarMore } from '#/Appbar/AppbarMore';
import { Divider, Menu } from 'react-native-paper';
import { Appbar } from '#/Appbar/Appbar';
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
import { graphql } from 'relay-runtime';
import { useLazyQuery } from '~/api';
import { Id_MessageScreenQuery } from '~/api/__generated__/Id_MessageScreenQuery.graphql';

const Query = graphql`
  query Id_MessageScreenQuery($id: ID!) {
    message(id: $id) @required(action: THROW) {
      id
      label
      message
      typedData
      account {
        id
        chain
        ...AccountSection_account
        ...useRemoveMessage_account
      }
      dapp {
        ...DappHeader_dappMetadata
      }
      ...useRemoveMessage_message
      ...MessageStatus_message
      ...MessageActions_message
    }

    user {
      id
      ...MessageActions_user
    }
  }
`;

const MessageScreenParams = z.object({ id: zUuid() });

export default function MessageScreen() {
  const { id } = useLocalParams(MessageScreenParams);

  const { message: m, user } = useLazyQuery<Id_MessageScreenQuery>(Query, { id });
  const remove = useRemoveMessage({ account: m.account, message: m });

  return (
    <SideSheetLayout defaultVisible>
      <Appbar
        headline={(props) => <MessageStatus message={m} {...props} />}
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
        {m.dapp && <DappHeader dapp={m.dapp} action="wants you to sign" />}

        <AccountSection account={m.account} />
        <Divider horizontalInset style={styles.divider} />

        <View style={styles.messageContainer}>
          <ListHeader>Message</ListHeader>
          <DataView chain={m.account.chain} style={styles.messageData}>
            {m.typedData ?? m.message}
          </DataView>
        </View>

        <MessageActions message={m} user={user} />
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
