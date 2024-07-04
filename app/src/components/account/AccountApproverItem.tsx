import { AddressIcon } from '#/Identicon/AddressIcon';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { ContactsIcon, DevicesIcon, NavigateNextIcon } from '@theme/icons';
import { createStyles } from '@theme/styles';
import { Link } from 'expo-router';
import { UAddress } from 'lib';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { AccountApproverItem_approver$key } from '~/api/__generated__/AccountApproverItem_approver.graphql';
import { AccountApproverItem_user$key } from '~/api/__generated__/AccountApproverItem_user.graphql';
import { truncateAddr } from '~/util/format';

const Approver = graphql`
  fragment AccountApproverItem_approver on Approver {
    id
    address
    label
  }
`;

const User = graphql`
  fragment AccountApproverItem_user on User {
    id
    approvers {
      id
    }
  }
`;

export interface AccountApproverItemProps extends Partial<ListItemProps> {
  account: UAddress;
  approver: AccountApproverItem_approver$key;
  user: AccountApproverItem_user$key;
}

export function AccountApproverItem({ account, ...props }: AccountApproverItemProps) {
  const a = useFragment(Approver, props.approver);
  const user = useFragment(User, props.user);
  const isUserApprover = user.approvers.some((ua) => ua.id === a.id);

  return (
    <Link
      href={{
        pathname: '/(nav)/[account]/settings/approver/[address]',
        params: { account, address: a.address },
      }}
      asChild
    >
      <ListItem
        leading={<AddressIcon address={a.address} />}
        headline={a.label || truncateAddr(a.address)}
        lines={2}
        trailing={
          <View style={styles.trailing}>
            {isUserApprover ? <DevicesIcon /> : <ContactsIcon />}
            <NavigateNextIcon />
          </View>
        }
        {...props}
      />
    </Link>
  );
}

const styles = createStyles({
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
