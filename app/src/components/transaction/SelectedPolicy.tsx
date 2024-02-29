import Collapsible from 'react-native-collapsible';
import { SatisfiablePolicyItem } from './SatisfiablePolicyItem';
import { Chevron } from '#/Chevron';
import { useToggle } from '~/hooks/useToggle';
import { Divider } from 'react-native-paper';
import { FragmentType, gql, useFragment } from '@api/generated';
import { OtherPolicies } from './OtherPolicies';
import { createStyles } from '@theme/styles';

const Proposal = gql(/* GraphQL */ `
  fragment SelectedPolicy_Proposal on Proposal @argumentDefinitions(proposal: { type: "UUID!" }) {
    id
    ... on Transaction {
      updatable
    }
    ... on Message {
      updatable
    }
    policy {
      id
      ...SatisfiabePolicyItem_Policy @arguments(proposal: $proposal)
    }
    ...OtherPolicies_Proposal
  }
`);

export interface SelectedPolicyProps {
  proposal: FragmentType<typeof Proposal>;
}

export function SelectedPolicy(props: SelectedPolicyProps) {
  const proposal = useFragment(Proposal, props.proposal);

  const [expanded, toggleExpanded] = useToggle(false);

  return (
    <>
      <SatisfiablePolicyItem
        policy={proposal.policy}
        {...(proposal.updatable && {
          onPress: toggleExpanded,
          trailing: (props) => <Chevron {...props} expanded={expanded} />,
        })}
      />

      <Divider horizontalInset style={styles.divider} />

      <Collapsible collapsed={!expanded}>
        <OtherPolicies proposal={proposal} toggleExpanded={toggleExpanded} />
      </Collapsible>
    </>
  );
}

const styles = createStyles({
  divider: {
    marginVertical: 4,
  },
});
