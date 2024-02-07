import { StyleSheet, View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { SatisfiablePolicyItem } from './SatisfiablePolicyItem';
import { Chevron } from '#/Chevron';
import { useToggle } from '~/hooks/useToggle';
import { Divider } from 'react-native-paper';
import { FragmentType, gql, useFragment } from '@api/generated';
import { useMutation } from 'urql';

const FragmentDoc = gql(/* GraphQL */ `
  fragment SelectedPolicy_ProposalFragment on Proposal
  @argumentDefinitions(proposal: { type: "UUID!" }) {
    id
    ... on TransactionProposal {
      updatable
    }
    ... on MessageProposal {
      updatable
    }
    account {
      id
      policies {
        id
        key
        satisfiability(input: { proposal: $proposal }) {
          result
        }
        ...SatisfiabePolicyItem_PolicyFragment @arguments(proposal: $proposal)
      }
    }
    policy {
      id
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation SelectedPolicy_Update($id: UUID!, $policy: PolicyKey!) {
    updateProposal(input: { id: $id, policy: $policy }) {
      id
      policy {
        id
      }
    }
  }
`);

export interface SelectedPolicyProps {
  proposal: FragmentType<typeof FragmentDoc>;
}

export const SelectedPolicy = (props: SelectedPolicyProps) => {
  const proposal = useFragment(FragmentDoc, props.proposal);
  const update = useMutation(Update)[1];

  const [expanded, toggleExpanded] = useToggle(false);

  const selected =
    proposal.account.policies.find(({ id }) => id === proposal.policy?.id) ??
    proposal.account.policies[0];

  const satisfiablePolicies = proposal.account.policies.filter(
    (p) => p.satisfiability.result !== 'unsatisfiable',
  );

  return (
    <>
      <SatisfiablePolicyItem
        policy={selected}
        {...(proposal.updatable && {
          onPress: toggleExpanded,
          trailing: ({ Text, ...props }) => (
            <View style={styles.trailingContainer}>
              <Text>{satisfiablePolicies.length}</Text>

              <Chevron {...props} expanded={expanded} />
            </View>
          ),
        })}
      />

      <Divider horizontalInset />

      <Collapsible collapsed={!expanded}>
        {proposal.account.policies.map((p) => (
          <SatisfiablePolicyItem
            key={p.id}
            policy={p}
            selected={p.id === selected.id}
            onPress={() => {
              if (p.key !== selected.key) update({ id: proposal.id, policy: p.key });
              toggleExpanded();
            }}
          />
        ))}
      </Collapsible>
    </>
  );
};

const styles = StyleSheet.create({
  trailingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});
