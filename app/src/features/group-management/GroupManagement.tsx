import { useEffect, useMemo } from 'react';
import { Address, Approver, isPresent, PERCENT_THRESHOLD } from 'lib';
import { useNavigation } from '@react-navigation/native';
import { GroupManagementScreenProps } from './GroupManagementScreen';
import { ApproverItem } from './approver/ApproverItem';
import { Box } from '@components/Box';
import { FormikErrors } from '@components/fields/FormikErrors';
import { Actions } from '@components/Actions';
import { FormikSubmitFab } from '@components/fields/FormikSubmitFab';
import { ActionsSpaceFooter } from '@components/ActionsSpaceFooter';
import { GroupAppbar } from './GroupAppbar';
import { FlatList } from 'react-native';
import { withProposeProvider } from '@features/execute/ProposeProvider';
import { CombinedGroup } from '~/queries/safe';

export interface GroupManagementProps {
  approvers: Approver[];
  setApprovers: (approvers: Approver[]) => void;
  selected?: Address;
  initialGroup: CombinedGroup;
}

export const GroupManagement = withProposeProvider(
  ({
    approvers,
    setApprovers,
    selected,
    initialGroup,
  }: GroupManagementProps) => {
    const navigation =
      useNavigation<GroupManagementScreenProps['navigation']>();

    useEffect(() => {
      if (selected) {
        setApprovers([
          ...approvers,
          { addr: selected, weight: PERCENT_THRESHOLD },
        ]);
        navigation.setParams({ selected: undefined });
      }
    }, [selected, approvers, setApprovers, navigation]);

    const handleSetApprover =
      (approver: Approver) => (newApprover?: Approver) => {
        const i = approvers.findIndex((a) => a.addr === approver.addr);
        setApprovers(
          [
            ...approvers.slice(0, i),
            newApprover,
            ...approvers.slice(i + 1),
          ].filter(isPresent),
        );
      };

    const effectiveGroup = useMemo(
      () => ({ ...initialGroup, approvers }),
      [approvers, initialGroup],
    );

    return (
      <Box flex={1}>
        <GroupAppbar group={effectiveGroup} />

        <Box horizontal center>
          <FormikErrors />
        </Box>

        <FlatList
          data={approvers}
          renderItem={({ item }) => (
            <ApproverItem
              approver={item}
              setApprover={handleSetApprover(item)}
              isOnlyApprover={approvers.length === 1}
              py={2}
              px={3}
            />
          )}
          ListFooterComponent={ActionsSpaceFooter}
        />

        <Actions>
          <FormikSubmitFab icon="check" label="Save" hideWhenClean />
        </Actions>
      </Box>
    );
  },
);
