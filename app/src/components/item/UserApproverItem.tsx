import { FragmentType, gql, useFragment } from '@api/generated';
import { useApproverAddress } from '~/lib/network/useApprover';
import { useRouter } from 'expo-router';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { truncateAddr } from '~/util/format';
import { AddressIcon } from '#/Identicon/AddressIcon';

const UserApprover = gql(/* GraphQL */ `
  fragment UserApproverItem_UserApprover on UserApprover {
    id
    address
    name
    cloud {
      provider
      subject
    }
  }
`);

export interface UserApproverItemProps extends Partial<ListItemProps> {
  approver: FragmentType<typeof UserApprover>;
}

export function UserApproverItem(props: UserApproverItemProps) {
  const a = useFragment(UserApprover, props.approver);
  const router = useRouter();
  const selected = useApproverAddress() === a.address;

  return (
    <ListItem
      leading={<AddressIcon address={a.address} />}
      headline={a.name}
      supporting={truncateAddr(a.address)}
      {...(selected && { trailing: 'This device' })}
      onPress={() =>
        router.push({ pathname: `/(nav)/approvers/[address]/`, params: { address: a.address } })
      }
      {...props}
    />
  );
}
