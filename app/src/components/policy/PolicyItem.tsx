import { ListItem, ListItemProps } from '#/list/ListItem';
import { PolicyIcon } from '@theme/icons';
import { forwardRef } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { PolicyItem_policy$key } from '~/api/__generated__/PolicyItem_policy.graphql';

const Policy = graphql`
  fragment PolicyItem_policy on Policy {
    id
    name
    threshold
    approvers {
      id
    }
  }
`;

export interface PolicyItemProps extends Partial<ListItemProps> {
  policy: PolicyItem_policy$key;
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
