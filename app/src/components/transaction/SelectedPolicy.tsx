import { Chevron } from '#/Chevron';
import { useToggle } from '~/hooks/useToggle';
import { OtherPolicies } from './OtherPolicies';
import { createStyles, useStyles } from '@theme/styles';
import { PolicyItem } from '#/policy/PolicyItem';
import { View } from 'react-native';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { SelectedPolicy_proposal$key } from '~/api/__generated__/SelectedPolicy_proposal.graphql';
import { ItemList } from '#/layout/ItemList';

const Proposal = graphql`
  fragment SelectedPolicy_proposal on Proposal {
    id
    ... on Transaction {
      updatable
    }
    ... on Message {
      updatable
    }
    policy {
      id
      ...PolicyItem_policy
    }
    validationErrors {
      reason
    }
    ...OtherPolicies_proposal
  }
`;

export interface SelectedPolicyProps {
  proposal: SelectedPolicy_proposal$key;
}

export function SelectedPolicy(props: SelectedPolicyProps) {
  const { styles } = useStyles(stylesheet);
  const proposal = useFragment(Proposal, props.proposal);

  const [expanded, toggleExpanded] = useToggle(false);

  return (
    <ItemList>
      <PolicyItem
        policy={proposal.policy}
        containerStyle={styles.item}
        trailing={({ Text, ...props }) => (
          <View style={styles.trailingContainer}>
            {proposal.validationErrors.length !== 0 && (
              <Text style={styles.error}>Insufficient permission</Text>
            )}

            {proposal.updatable && <Chevron {...props} expanded={expanded} />}
          </View>
        )}
        {...(proposal.updatable && { onPress: toggleExpanded })}
      />

      {expanded && <OtherPolicies proposal={proposal} toggleExpanded={toggleExpanded} />}
    </ItemList>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  trailingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  error: {
    color: colors.error,
  },
  item: {
    backgroundColor: colors.surface,
  },
}));
