import { FragmentType, gql, useFragment } from '@api/generated';
import { match } from 'ts-pattern';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { PolicyIcon } from '#/policy/PolicyIcon';

const Policy = gql(/* GraphQL */ `
  fragment PolicyItem_Policy on Policy {
    id
    name
    state {
      id
      threshold
      approvers {
        id
      }
    }
    draft {
      id
      threshold
      approvers {
        id
      }
    }
    ...PolicyIcon_Policy
  }
`);

export interface PolicyItemProps extends Partial<ListItemProps> {
  policy: FragmentType<typeof Policy>;
}

export function PolicyItem(props: PolicyItemProps) {
  const policy = useFragment(Policy, props.policy);

  const state = (policy.state ?? policy.draft)!;

  return (
    <ListItem
      leading={(props) => <PolicyIcon policy={policy} {...props} />}
      headline={policy.name}
      supporting={match(state.approvers.length)
        .with(0, () => 'No approvers')
        .with(1, () => '1 approver')
        .otherwise((approvers) => `${state.threshold}/${approvers} approvers`)}
      {...props}
    />
  );
}
