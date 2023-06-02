import { WPolicy } from '@api/policy';
import { Proposal, useUpdateProposal } from '@api/proposal';
import { PolicyIcon, PolicyUnsatisfiableIcon } from '@theme/icons';
import { StyleSheet, View } from 'react-native';
import { ListItem } from '~/components/list/ListItem';
import Collapsible from 'react-native-collapsible';
import { SatisfiablePolicyItem } from './SatisfiablePolicyItem';
import { Chevron } from '~/components/Chevron';
import { useToggle } from '@hook/useToggle';
import { Divider } from 'react-native-paper';

export interface SelectedPolicyProps {
  proposal: Proposal;
  policy?: WPolicy;
}

export const SelectedPolicy = ({ proposal, policy }: SelectedPolicyProps) => {
  const updateProposal = useUpdateProposal();

  const [expanded, toggleExpanded] = useToggle(false);

  if (!policy)
    return <ListItem leading={PolicyUnsatisfiableIcon} headline="No satisfiable policy" />;

  return (
    <>
      <ListItem
        leading={PolicyIcon}
        headline={policy.name}
        {...(proposal.updatable && {
          trailing: 'Only satisfiable policy',
          ...(proposal.satisfiablePolicies.length > 1 && {
            onPress: toggleExpanded,
            trailing: ({ Text, ...props }) => (
              <View style={styles.trailingContainer}>
                <Text>{proposal.satisfiablePolicies.length}</Text>

                <Chevron {...props} expanded={expanded} />
              </View>
            ),
          }),
        })}
      />

      <Divider horizontalInset />

      <Collapsible collapsed={!expanded}>
        {proposal.satisfiablePolicies.map((p) => (
          <SatisfiablePolicyItem
            key={p.key}
            policy={p}
            selected={p.key === policy.key}
            onPress={() => {
              if (p.key !== policy.key) updateProposal({ hash: proposal.hash, policy: p.key });
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
