import { SearchParams } from 'expo-router';
import { useImmerAtom } from 'jotai-immer';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ListItemHeight } from '~/components/list/ListItem';
import { Fab } from '~/components/Fab';
import { AddIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Text } from 'react-native-paper';
import { Address } from 'lib';
import { showInfo } from '~/components/provider/SnackbarProvider';
import { ThresholdChip } from '~/components/policy/ThresholdChip';
import { ApproverItem } from '~/components/policy/ApproverItem';
import { POLICY_DRAFT_ATOM } from '~/lib/policy/draft';
import { useSelectAddress } from '~/hooks/useSelectAddress';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { ScreenSurface } from '~/components/layout/ScreenSurface';

export type PolicyApproversScreenRoute = `/(drawer)/[account]/policies/[key]/approvers`;
export type PolicyApproversScreenParams = SearchParams<PolicyApproversScreenRoute>;

function PolicyApproversScreen() {
  const styles = useStyles();
  const [policy, updatePolicy] = useImmerAtom(POLICY_DRAFT_ATOM);
  const selectAddress = useSelectAddress();

  const addApprover = async () => {
    const address = await selectAddress({
      include: ['approvers', 'contacts'],
      disabled: [...policy.approvers],
    });
    if (address) {
      updatePolicy((draft) => {
        draft.approvers.add(address);
        draft.threshold++;
      });
    }
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
    <>
      <AppbarOptions mode="large" headline={`${policy.name} approvers`} />

      <ScreenSurface>
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

        <Fab
          icon={AddIcon}
          label="Add approver"
          onPress={() => {
            addApprover();
          }}
          variant="primary"
        />
      </ScreenSurface>
    </>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  root: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  noApproversText: {
    textAlign: 'center',
    marginVertical: 8,
    marginHorizontal: 16,
    color: colors.warning,
  },
}));

export default withSuspense(PolicyApproversScreen, ScreenSkeleton);
