import { FragmentType, gql, useFragment } from '@api/generated';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { PolicyIcon } from '@theme/icons';
import { forwardRef } from 'react';
import { View } from 'react-native';

const Policy = gql(/* GraphQL */ `
  fragment PolicyItem_Policy on Policy {
    id
    name
    threshold
    approvers {
      id
    }
  }
`);

export interface PolicyItemProps extends Partial<ListItemProps> {
  policy: FragmentType<typeof Policy>;
}

export const PolicyItem = forwardRef<View, PolicyItemProps>((props, ref) => {
  const p = useFragment(Policy, props.policy);

  return (
    <ListItem
      ref={ref}
      leading={PolicyIcon}
      headline={p.name}
      supporting={`${p.threshold}/${p.approvers.length} approvals`}
      {...props}
    />
  );
});
