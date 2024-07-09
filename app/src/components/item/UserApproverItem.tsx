import { useApproverAddress } from '~/lib/network/useApprover';
import { useRouter } from 'expo-router';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { truncateAddr } from '~/util/format';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { UserApproverItem_approver$key } from '~/api/__generated__/UserApproverItem_approver.graphql';

const UserApprover = graphql`
  fragment UserApproverItem_approver on Approver {
    id
    address
    label
  }
`;

export interface UserApproverItemProps extends Partial<ListItemProps> {
  approver: UserApproverItem_approver$key;
}

export function UserApproverItem(props: UserApproverItemProps) {
  const a = useFragment(UserApprover, props.approver);
  const router = useRouter();
  const selected = useApproverAddress() === a.address;

  return (
    <ListItem
      leading={<AddressIcon address={a.address} />}
      headline={a.label}
      supporting={truncateAddr(a.address)}
      {...(selected && { trailing: 'This device' })}
      onPress={() =>
        router.push({ pathname: `/(nav)/approvers/[address]/`, params: { address: a.address } })
      }
      {...props}
    />
  );
}
