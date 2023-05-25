import { usePolicy } from '@api/policy';
import { SatisfiablePolicy } from '@api/proposal';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { PolicyIcon } from '~/components/policy/PolicyIcon';

export interface SatisfiablePolicyItemProps extends Partial<ListItemProps> {
  policy: SatisfiablePolicy;
}

export const SatisfiablePolicyItem = ({ policy: p, ...itemProps }: SatisfiablePolicyItemProps) => {
  const policy = usePolicy(p);

  return (
    <ListItem
      leading={(props) => <PolicyIcon policy={policy} {...props} />}
      headline={policy.name}
      {...itemProps}
    />
  );
};
