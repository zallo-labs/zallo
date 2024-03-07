import { FragmentType, gql, useFragment } from '@api/generated';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { materialCommunityIcon } from '@theme/icons';
import { Blockie } from '#/Identicon/Blockie';
import { truncateAddr } from '~/util/format';

const GroupIcon = materialCommunityIcon('account-supervisor-circle');

const Policy = gql(/* GraphQL */ `
  fragment PolicyItem_Policy on Policy {
    id
    name
    stateOrDraft {
      id
      threshold
      approvers {
        id
        address
        label
      }
    }
  }
`);

export interface PolicyItemProps extends Partial<ListItemProps> {
  policy: FragmentType<typeof Policy>;
}

export function PolicyItem(props: PolicyItemProps) {
  const policy = useFragment(Policy, props.policy);
  const state = policy.stateOrDraft;
  const approver = state.approvers.length === 1 ? state.approvers[0] : null;

  return approver ? (
    <ListItem
      leading={(props) => <Blockie seed={approver.address} {...props} />}
      leadingSize="medium"
      headline={approver.label ?? truncateAddr(approver.address)}
      supporting={policy.name}
      {...props}
    />
  ) : (
    <ListItem
      leading={GroupIcon}
      leadingSize="medium"
      headline={policy.name}
      supporting={`${state.threshold}/${state.approvers.length} approvals`}
      {...props}
    />
  );
}
