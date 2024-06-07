import { ContactsIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { Address, asAddress, asChain, asUAddress } from 'lib';
import { View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Chevron } from '#/Chevron';
import { ListItem } from '#/list/ListItem';
import { ListItemHorizontalTrailing } from '#/list/ListItemHorizontalTrailing';
import { ListItemTrailingText } from '#/list/ListItemTrailingText';
import { ApproverItem } from '#/policy/ApproverItem';
import { ThresholdChip } from './ThresholdChip';
import { showInfo } from '#/provider/SnackbarProvider';
import { useSelectAddress } from '~/hooks/useSelectAddress';
import { useToggle } from '~/hooks/useToggle';
import { usePolicyDraft } from '~/lib/policy/draft';
import { CORNER } from '@theme/paper';
import { AddCircleIcon } from '#/AddCircleIcon';
import { CollapsibleItemList } from '#/layout/CollapsibleItemList';

export function ApprovalSettings() {
  const { styles } = useStyles(stylesheet);
  const selectAddress = useSelectAddress();

  const [policy, update] = usePolicyDraft();
  const [expanded, toggleExpanded] = useToggle(false);

  const addApprover = async () => {
    const address = await selectAddress({
      include: ['approvers', 'contacts'],
      disabled: [...policy.approvers],
    });
    if (address) {
      update((draft) => {
        draft.approvers.add(asAddress(address));
        draft.threshold++;
      });
    }
  };

  const remove = (approver: Address) => {
    const originalThreshold = policy.threshold;

    update((draft) => {
      draft.approvers.delete(approver);
      draft.threshold = Math.max(policy.threshold, policy.approvers.size);
    });

    showInfo('Approver removed', {
      action: {
        label: 'Undo',
        onPress: () =>
          update((draft) => {
            draft.approvers.add(approver);
            draft.threshold = originalThreshold;
          }),
      },
    });
  };

  return (
    <CollapsibleItemList expanded={expanded}>
      <View style={styles.surface}>
        <ListItem
          leading={ContactsIcon}
          headline="Approvals"
          supporting="Who can approve an action and how many are required"
          trailing={(props) => (
            <ListItemHorizontalTrailing>
              <ListItemTrailingText>{`${policy.threshold}/${policy.approvers.size} required`}</ListItemTrailingText>
              <Chevron expanded={expanded} {...props} />
            </ListItemHorizontalTrailing>
          )}
          onPress={toggleExpanded}
          containerStyle={styles.header}
        />

        <Collapsible collapsed={!expanded}>
          <View style={styles.headerExtras}>
            <ThresholdChip />
          </View>
        </Collapsible>
      </View>

      {[...policy.approvers].map((item) => (
        <ApproverItem
          key={item}
          address={asUAddress(item, asChain(policy.account))}
          remove={() => remove(item)}
        />
      ))}

      <ListItem
        lines={2}
        leading={AddCircleIcon}
        headline="Add approver"
        onPress={addApprover}
        containerStyle={styles.surface}
      />
    </CollapsibleItemList>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  surface: {
    backgroundColor: colors.surface,
  },
  header: {
    borderRadius: CORNER.l,
  },
  headerExtras: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
    marginLeft: 16,
    marginRight: 24,
  },
}));
