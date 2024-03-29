import { FragmentType, gql, useFragment } from '@api/generated';
import { useMutation } from 'urql';
import { useQuery } from '~/gql';
import { withSuspense } from '#/skeleton/withSuspense';
import { ListItemSkeleton } from '#/list/ListItemSkeleton';
import { PolicyIcon } from '@theme/icons';
import { PolicyItem } from '#/policy/PolicyItem';
import { createStyles, useStyles } from '@theme/styles';

// TODO: replace query with @deferred fragment once supported (graphql-js 17)
const Query = gql(/* GraphQL */ `
  query OtherPolicies($proposal: ID!) {
    proposal(input: { id: $proposal }) {
      id
      account {
        id
        policies {
          id
          key
          validationErrors(proposal: $proposal) {
            reason
          }
          ...PolicyItem_Policy
        }
      }
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation OtherPolicies_Update($proposal: ID!, $policy: PolicyKey!) {
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
  const { styles } = useStyles(stylesheet);
  const proposal = useFragment(Proposal, props.proposal);
  const update = useMutation(Update)[1];

  const policies = useQuery(Query, { proposal: proposal.id }).data.proposal?.account.policies ?? [];

  return (
    <>
      {policies.map((p) => (
        <PolicyItem
          key={p.id}
          policy={p}
          {...(p.validationErrors.length && {
            trailing: ({ Text }) => <Text style={styles.error}>Insufficient permission</Text>,
          })}
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

const stylesheet = createStyles(({ colors }) => ({
  error: {
    color: colors.error,
  },
}));

export const OtherPolicies = withSuspense(OtherPolicies_, () => (
  <>
    <ListItemSkeleton leading={PolicyIcon} supporting />
    <ListItemSkeleton leading={PolicyIcon} supporting />
  </>
));
