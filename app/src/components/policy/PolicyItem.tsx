import { FragmentType, gql, useFragment } from '@api/generated';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { truncateAddr } from '~/util/format';
import { GroupIcon } from '@theme/icons';
import { AddressIcon } from '#/Identicon/AddressIcon';

const Policy = gql(/* GraphQL */ `
  fragment PolicyItem_Policy on Policy {
    id
    name
    threshold
    approvers {
      id
      address
      label
    }
  }
`);

export interface PolicyItemProps extends Partial<ListItemProps> {
  policy: FragmentType<typeof Policy>;
}

export function PolicyItem(props: PolicyItemProps) {
  const policy = useFragment(Policy, props.policy);
  const approver = policy.approvers.length === 1 ? policy.approvers[0] : null;

  return approver ? (
    <ListItem
      leading={<AddressIcon address={approver.address} />}
      headline={approver.label ?? truncateAddr(approver.address)}
      supporting={policy.name}
      {...props}
    />
  ) : (
    <ListItem
      leading={GroupIcon}
      leadingSize="medium"
      headline={policy.name}
      supporting={`${policy.threshold}/${policy.approvers.length} approvals`}
      {...props}
    />
  );
}
