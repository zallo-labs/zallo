import { FragmentType, gql, useFragment } from '@api/generated';
import { PolicyIcon } from '@theme/icons';
import { match } from 'ts-pattern';
import { ListItem, ListItemProps } from '#/list/ListItem';

const Policy = gql(/* GraphQL */ `
  fragment SatisfiabePolicyItem_Policy on Policy @argumentDefinitions(proposal: { type: "UUID!" }) {
    id
    name
    satisfiability(input: { proposal: $proposal }) {
      result
    }
  }
`);

export interface SatisfiablePolicyItemProps extends Partial<ListItemProps> {
  policy: FragmentType<typeof Policy>;
}

export const SatisfiablePolicyItem = ({
  policy: policyFragment,
  ...itemProps
}: SatisfiablePolicyItemProps) => {
  const p = useFragment(Policy, policyFragment);

  return (
    <ListItem
      leading={PolicyIcon}
      headline={p.name}
      supporting={match(p.satisfiability.result)
        .with('unsatisfiable', () => 'Policy lacks permission to execute this transaction')
        .with('satisfiable', () => 'Awaiting approval')
        .with('satisfied', () => 'Satisfied')
        .exhaustive()}
      {...itemProps}
    />
  );
};
