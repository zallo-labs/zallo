import { FragmentType, gql, useFragment } from '@api/gen';
import { PolicyIcon } from '@theme/icons';
import { match } from 'ts-pattern';
import { ListItem, ListItemProps } from '~/components/list/ListItem';

const FragmentDoc = gql(/* GraphQL */ `
  fragment SatisfiabePolicyItem_PolicyFragment on Policy
  @argumentDefinitions(proposal: { type: "Bytes32!" }) {
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
