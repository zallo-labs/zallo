import Collapsible from 'react-native-collapsible';
import { Chevron } from '#/Chevron';
import { useToggle } from '~/hooks/useToggle';
import { Divider } from 'react-native-paper';
import { FragmentType, gql, useFragment } from '@api/generated';
import { OtherPolicies } from './OtherPolicies';
import { createStyles, useStyles } from '@theme/styles';
import { PolicyItem } from '#/policy/PolicyItem';
import { View } from 'react-native';

const Proposal = gql(/* GraphQL */ `
  fragment SelectedPolicy_Proposal on Proposal @argumentDefinitions(proposal: { type: "ID!" }) {
    id
    ... on Transaction {
      updatable
    }
    ... on Message {
      updatable
    }
    policy {
      id
      ...PolicyItem_Policy
    }
    validationErrors {
      reason
    }
    ...OtherPolicies_Proposal
  }
`);

export interface SelectedPolicyProps {
  proposal: FragmentType<typeof Proposal>;
}

export function SelectedPolicy(props: SelectedPolicyProps) {
  const { styles } = useStyles(stylesheet);
  const proposal = useFragment(Proposal, props.proposal);

  const [expanded, toggleExpanded] = useToggle(false);

  return (
    <>
      <PolicyItem
        policy={proposal.policy}
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

      <Divider horizontalInset style={styles.divider} />

      <Collapsible collapsed={!expanded}>
        <OtherPolicies proposal={proposal} toggleExpanded={toggleExpanded} />
      </Collapsible>
    </>
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
  divider: {
    marginVertical: 4,
  },
}));
