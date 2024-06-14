import { useLinkGoogle } from '#/cloud/google/useLinkGoogle';
import { useLinkApple } from '#/cloud/useLinkApple';
import { ListItem } from '#/list/ListItem';
import { Sheet } from '#/sheet/Sheet';
import { withSuspense } from '#/skeleton/withSuspense';
import { gql } from '@api';
import {
  AppleBlackIcon,
  BluetoothIcon,
  ContactsIcon,
  DevicesIcon,
  GoogleIcon,
  LedgerIcon,
  NavigateNextIcon,
  QrCodeIcon,
  ZalloIconMinimal,
} from '@theme/icons';
import { createStyles } from '@theme/styles';
import { Divider, Text } from 'react-native-paper';
import { useQuery } from '~/gql';
import { Address, asAddress, asChain } from 'lib';
import { useLinkZallo } from '../../../(modal)/link';
import { AccountParams } from '~/app/(drawer)/[account]/(home)/_layout';
import { useLocalParams } from '~/hooks/useLocalParams';
import { useRouter } from 'expo-router';
import { useLinkLedger } from '#/link/ledger/LedgerItem';
import { useSelectAddress } from '~/hooks/useSelectAddress';

const Query = gql(/* GraphQL */ `
  query AddApproverSheet {
    user {
      id
      ...useLinkApple_User
      ...useLinkGoogle_User
    }
  }
`);

function AddApproverSheet() {
  const { account } = useLocalParams(AccountParams);
  const router = useRouter();
  const selectAddress = useSelectAddress();

  const { user } = useQuery(Query).data;

  const linkZallo = useLinkZallo();
  const linkLedger = useLinkLedger();
  const linkApple = useLinkApple({ user });
  const linkGoogle = useLinkGoogle({ user });

  const add = (approver: Address | null | undefined) => {
    if (approver)
      router.push({
        pathname: '/(drawer)/[account]/settings/approver/[address]',
        params: { account, address: approver },
      });
  };

  return (
    <Sheet>
      <ListItem
        leading={ContactsIcon}
        headline="Add friend as approver"
        trailing={NavigateNextIcon}
        onPress={async () =>
          add(
            asAddress(
              await selectAddress({
                headline: 'Add new approver',
                include: ['contacts'],
                chain: asChain(account),
              }),
            ),
          )
        }
      />

      <Divider horizontalInset style={styles.divider} />

      <Text variant="titleMedium" style={styles.subheader}>
        Add my own approver
      </Text>

      {linkLedger && (
        <ListItem
          leading={LedgerIcon}
          headline="Ledger"
          trailing={BluetoothIcon}
          onPress={async () => add(await linkLedger())}
        />
      )}

      {linkApple && (
        <ListItem
          leading={AppleBlackIcon}
          headline="Apple"
          trailing={NavigateNextIcon}
          onPress={async () => add(await linkApple())}
        />
      )}

      {linkGoogle && (
        <ListItem
          leading={GoogleIcon}
          headline="Google"
          trailing={NavigateNextIcon}
          onPress={async () => add(await linkGoogle())}
        />
      )}

      <ListItem
        leading={ZalloIconMinimal}
        headline="Zallo"
        trailing={QrCodeIcon}
        onPress={async () => add(await linkZallo())}
      />

      <ListItem
        leading={DevicesIcon}
        headline="Linked device"
        trailing={NavigateNextIcon}
        containerStyle={styles.lastItem}
        onPress={async () =>
          add(
            asAddress(
              await selectAddress({
                headline: 'Add new approver',
                include: ['approvers'],
                chain: asChain(account),
              }),
            ),
          )
        }
      />
    </Sheet>
  );
}

const styles = createStyles({
  container: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 8,
  },
  subheader: {
    marginHorizontal: 16,
  },
  lastItem: {
    marginBottom: 8,
  },
});

export default withSuspense(AddApproverSheet, null);

export { ErrorBoundary } from '#/ErrorBoundary';
