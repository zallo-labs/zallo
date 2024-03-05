import { FragmentType, gql, useFragment } from '@api/generated';
import { useMutation } from 'urql';
import { useQuery } from '~/gql';
import { withSuspense } from '#/skeleton/withSuspense';
import { ListItemSkeleton } from '#/list/ListItemSkeleton';
import { PolicyIcon } from '@theme/icons';
import { ListItem } from '#/list/ListItem';

// TODO: replace query with @deferred fragment once supported (graphql-js 17)
const Query = gql(/* GraphQL */ `
  query OtherPolicies($proposal: UUID!) {
    proposal(input: { id: $proposal }) {
      id
      account {
        id
        policies {
          id
          key
          name
          validationErrors(input: { proposal: $proposal }) {
            reason
          }
        }
      }
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation OtherPolicies_Update($proposal: UUID!, $policy: PolicyKey!) {
    updateProposal(input: { id: $proposal, policy: $policy }) {
      id
      policy {
        id
      }
    }
  }
`);

const Proposal = gql(/* GraphQL */ `
  fragment OtherPolicies_Proposal on Proposal {
    id
    policy {
      id
    }
  }
`);

interface OtherPoliciesProps {
  proposal: FragmentType<typeof Proposal>;
  toggleExpanded: () => void;
}

function OtherPolicies_(props: OtherPoliciesProps) {
  const proposal = useFragment(Proposal, props.proposal);
  const update = useMutation(Update)[1];

  const policies = useQuery(Query, { proposal: proposal.id }).data.proposal?.account.policies ?? [];

  return (
    <>
      {policies.map((p) => (
        <ListItem
          key={p.id}
          leading={PolicyIcon}
          headline={p.name}
          supporting={
            p.validationErrors.length
              ? 'Policy lacks permission to execute this transaction'
              : undefined
          }
          selected={p.id === proposal.policy.id}
          onPress={() => {
            if (p.id !== proposal.policy.id) update({ proposal: proposal.id, policy: p.key });
            props.toggleExpanded();
          }}
        />
      ))}
    </>
  );
}

export const OtherPolicies = withSuspense(OtherPolicies_, () => (
  <>
    <ListItemSkeleton leading={PolicyIcon} supporting />
    <ListItemSkeleton leading={PolicyIcon} supporting />
  </>
));
