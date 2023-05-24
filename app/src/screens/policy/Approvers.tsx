import { useImmerAtom } from 'jotai-immer';
import { useSelectContact } from '../contacts/useSelectContact';
import { makeStyles } from '@theme/makeStyles';
import { ListHeader } from '~/components/list/ListHeader';
import { View } from 'react-native';
import { ApproverItem } from './ApproverItem';
import { IconButton, Text } from 'react-native-paper';
import { showInfo } from '~/provider/SnackbarProvider';
import { POLICY_DRAFT_ATOM } from './PolicyDraft';
import { ThresholdChip } from './ThresholdChip';
import { PlusIcon } from '@theme/icons';

export interface ApproversProps {}

export const Approvers = (props: ApproversProps) => {
  const styles = useStyles();
  const selectContact = useSelectContact();

  const [{ account, approvers, threshold }, updateDraft] = useImmerAtom(POLICY_DRAFT_ATOM);

  const addApprover = async () => {
    const approver = await selectContact({ disabled: new Set([...approvers, account]) });
    updateDraft((draft) => {
      draft.approvers.add(approver.address);
    });
  };

  return (
    <>
      <ListHeader trailing={<ThresholdChip />}>Approvers</ListHeader>

      {threshold === 0 && (
        <Text style={styles.noApproversText}>
          {`Warning: no approvals are required.\nLiterally anyone may execute a transaction using this policy.`}
        </Text>
      )}

      <View style={styles.approversContainer}>
        {[...approvers].map((approver) => (
          <ApproverItem
            key={approver}
            approver={approver}
            remove={() => {
              updateDraft((draft) => {
                draft.approvers.delete(approver);
              });
              showInfo('Approver removed');
            }}
          />
        ))}

        <IconButton icon={PlusIcon} onPress={addApprover} />
      </View>
    </>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  approversContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: 16,
    rowGap: 16,
    columnGap: 24,
  },
  noApproversText: {
    marginVertical: 8,
    marginHorizontal: 16,
    color: colors.orange,
  },
}));
