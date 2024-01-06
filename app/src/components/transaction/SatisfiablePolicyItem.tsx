import { match } from 'ts-pattern';

import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { FragmentType, gql, useFragment } from '~/gql/api/generated';
import { PolicyIcon } from '~/util/theme/icons';

const FragmentDoc = gql(/* GraphQL */ `
  fragment SatisfiabePolicyItem_PolicyFragment on Policy
  @argumentDefinitions(proposal: { type: "UUID!" }) {
    id
    name
    satisfiability(input: { proposal: $proposal }) {
      result
    }
  }
`);

export interface SatisfiablePolicyItemProps extends Partial<ListItemProps> {
  policy: FragmentType<typeof FragmentDoc>;
}

export const SatisfiablePolicyItem = ({
  policy: policyFragment,
  ...itemProps
}: SatisfiablePolicyItemProps) => {
  const p = useFragment(FragmentDoc, policyFragment);

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
