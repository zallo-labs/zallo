import { FragmentType, gql, useFragment } from '@api/generated';
import { useApproverAddress } from '~/lib/network/useApprover';
import { Link } from 'expo-router';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { truncateAddr } from '~/util/format';

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
  const selected = useApproverAddress() === a.address;

  return (
    <Link
      href={{ pathname: `/(drawer)/approvers/[address]/`, params: { address: a.address } }}
      asChild
    >
      <ListItem
        leading={a.address}
        headline={a.name}
        supporting={truncateAddr(a.address)}
        {...(selected && { trailing: 'This device' })}
        {...props}
      />
    </Link>
  );
}
