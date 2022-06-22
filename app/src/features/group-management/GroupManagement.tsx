import { useEffect } from 'react';
import { Address, Approver, isPresent } from 'lib';
import { useNavigation } from '@react-navigation/native';
import { GroupManagementScreenProps } from './GroupManagementScreen';
import { ApproverItem } from './approver/ApproverItem';
import { Box } from '@components/Box';
import { FAB } from 'react-native-paper';
import { GroupNameField } from './GroupNameField';
import { FormikErrors } from '@components/fields/FormikErrors';
import { Actions } from '@components/Actions';
import { FormikSubmitFab } from '@components/fields/FormikSubmitFab';
import { CombinedGroup } from '~/queries';
import { Container } from '@components/list/Container';
import { ScreenScrollRoot } from '@components/ScreenScrollRoot';
import { ActionsSpaceFooter } from '@components/ActionsSpaceFooter';
import { Header } from '@components/Header';
import { Identicon } from '@components/Identicon';

export interface ApproverItemsProps {
  approvers: Approver[];
  setApprovers: (approvers: Approver[]) => void;
  selected?: Address;
  initialGroup: CombinedGroup;
}

export const GroupManagement = ({
  approvers,
  setApprovers,
  selected,
  initialGroup,
}: ApproverItemsProps) => {
  const navigation = useNavigation<GroupManagementScreenProps['navigation']>();

  useEffect(() => {
    if (selected) {
      setApprovers([...approvers, { addr: selected, weight: 100 }]);
      navigation.setParams({ selected: null });
    }
  }, [selected, approvers, setApprovers, navigation]);

  const handleSetApprover =
    (approver: Approver) => (newApprover: Approver | undefined) => {
      const i = approvers.findIndex((a) => a.addr === approver.addr);
      setApprovers(
        [
          ...approvers.slice(0, i),
          newApprover,
          ...approvers.slice(i + 1),
        ].filter(isPresent),
      );
    };

  const addApprover = () =>
    navigation.navigate('Contacts', {
      disabledAddrs: approvers.map((a) => a.addr),
    });

  return (
    <Box flex={1}>
      <ScreenScrollRoot flex={1} justifyContent="space-between">
        <Box mx={3} mt={4}>
          <Header
            Middle={<GroupNameField group={initialGroup} />}
            Right={<Identicon seed={initialGroup.ref} />}
          />

          <Box horizontal center>
            <FormikErrors />
          </Box>
        </Box>

        <Container>
          {approvers.map((approver) => (
            <ApproverItem
              key={approver.addr}
              approver={approver}
              setApprover={handleSetApprover(approver)}
              isOnlyApprover={approvers.length === 1}
              py={2}
              px={2}
            />
          ))}
        </Container>

        <ActionsSpaceFooter />
      </ScreenScrollRoot>

      <Actions>
        <FAB icon="account-plus" onPress={addApprover} label="Add" />
        <FormikSubmitFab icon="content-save" label="Save" hideWhenClean />
      </Actions>
    </Box>
  );
};
