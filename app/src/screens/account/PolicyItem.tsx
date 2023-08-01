import { FragmentType, gql, useFragment } from '@api/generated';
import { match } from 'ts-pattern';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { PolicyIcon } from '~/components/policy/PolicyIcon';

const Policy = gql(/* GraphQL */ `
  fragment PolicyItem_Policy on Policy {
    id
    name
    state {
      id
      approvers {
        id
      }
    }
    draft {
      id
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

  return (
    <ListItem
      leading={(props) => <PolicyIcon policy={policy} {...props} />}
      headline={policy.name}
      supporting={match((policy.state ?? policy.draft)!.approvers.length)
        .with(0, () => 'No approvers')
        .with(1, () => '1 approver')
        .otherwise((approvers) => `${approvers} approvers`)}
      {...props}
    />
  );
}
