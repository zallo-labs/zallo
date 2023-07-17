import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { POLICY_DRAFT_ATOM } from '../policy/PolicyDraft';
import { useImmerAtom } from 'jotai-immer';
import { Screen } from '~/components/layout/Screen';
import { Appbar } from '~/components/Appbar/Appbar';
import { View } from 'react-native';
import { ThresholdChip } from './ThresholdChip';
import { FlashList } from '@shopify/flash-list';
import { ApproverItem } from './ApproverItem';
import { ListItemHeight } from '~/components/list/ListItem';
import { Fab } from '~/components/buttons/Fab';
import { AddIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Text } from 'react-native-paper';
import { Address } from 'lib';
import { showInfo } from '~/provider/SnackbarProvider';
import { useSelectAddress } from '../addresses/useSelectAddress';

export interface ApproversScreenParams {}

export type ApproversScreenProps = StackNavigatorScreenProps<'Approvers'>;

export const ApproversScreen = withSuspense((props: ApproversScreenProps) => {
  const styles = useStyles();
  const [policy, updatePolicy] = useImmerAtom(POLICY_DRAFT_ATOM);
  const selectAddress = useSelectAddress({ disabled: [...policy.approvers, policy.account] });

  const addApprover = async () => {
    const address = await selectAddress({ disabled: ['accounts', ...policy.approvers] });
    updatePolicy((draft) => {
      draft.approvers.add(address);
      draft.threshold++;
    });
  };

  const remove = (approver: Address) => {
    const originalThreshold = policy.threshold;

    updatePolicy((draft) => {
      draft.approvers.delete(approver);
      draft.threshold = Math.max(policy.threshold, policy.approvers.size);
    });

    showInfo('Approver removed', {
      action: {
        label: 'Undo',
        onPress: () =>
          updatePolicy((draft) => {
            draft.approvers.add(approver);
            draft.threshold = originalThreshold;
          }),
      },
    });
  };

  return (
    <Screen>
      <Appbar mode="large" leading="back" headline={`${policy.name} approvers`} />

      <View style={styles.chipContainer}>
        <ThresholdChip />
      </View>

      <FlashList
        data={[...policy.approvers]}
        renderItem={({ item }) => <ApproverItem address={item} remove={() => remove(item)} />}
        keyExtractor={(item) => item}
        estimatedItemSize={ListItemHeight.SINGLE_LINE}
        ListEmptyComponent={
          <Text variant="titleMedium" style={styles.noApproversText}>
            No approvals are required - literally anyone may execute a transaction using this
            policy. Make sure this is intended!
          </Text>
        }
      />

      <Fab icon={AddIcon} label="Add approver" onPress={addApprover} variant="primary" />
    </Screen>
  );
}, ScreenSkeleton);

const useStyles = makeStyles(({ colors }) => ({
  chipContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  noApproversText: {
    textAlign: 'center',
    marginVertical: 8,
    marginHorizontal: 16,
    color: colors.warning,
  },
}));
