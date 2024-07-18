import { withSuspense } from '#/skeleton/withSuspense';
import { ListItemSkeleton } from '#/list/ListItemSkeleton';
import { PolicyIcon } from '@theme/icons';
import { PolicyItem } from '#/policy/PolicyItem';
import { createStyles, useStyles } from '@theme/styles';
import { memo } from 'react';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { OtherPolicies_proposal$key } from '~/api/__generated__/OtherPolicies_proposal.graphql';
import { useLazyQuery, useMutation } from '~/api';
import { OtherPoliciesQuery } from '~/api/__generated__/OtherPoliciesQuery.graphql';

// TODO: replace query with @deferred fragment once supported (graphql-js 17)
const Query = graphql`
  query OtherPoliciesQuery($proposal: ID!) {
    proposal(id: $proposal) @required(action: THROW) {
      id
      account {
        id
        policies {
          id
          key
          validationErrors(proposal: $proposal) {
            reason
          }
          ...PolicyItem_policy
        }
      }
    }
  }
`;

const Update = graphql`
  mutation OtherPoliciesMutation($proposal: ID!, $policy: PolicyKey!) {
    updateProposal(input: { id: $proposal, policy: $policy }) {
      id
      policy {
        id
      }
    }
  }
`;

const Proposal = graphql`
  fragment OtherPolicies_proposal on Proposal {
    id
    policy {
      id
    }
  }
`;

interface OtherPoliciesProps {
  proposal: OtherPolicies_proposal$key;
  toggleExpanded: () => void;
}

function OtherPolicies_(props: OtherPoliciesProps) {
  const { styles } = useStyles(stylesheet);
  const proposal = useFragment(Proposal, props.proposal);
  const update = useMutation(Update);

  const { policies } = useLazyQuery<OtherPoliciesQuery>(Query, { proposal: proposal.id }).proposal
    .account;

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

export const OtherPolicies = withSuspense(memo(OtherPolicies_), () => (
  <>
    <ListItemSkeleton leading={PolicyIcon} supporting />
    <ListItemSkeleton leading={PolicyIcon} supporting />
  </>
));
