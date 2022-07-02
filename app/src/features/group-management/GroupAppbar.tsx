import { AppbarBack } from '@components/AppbarBack';
import { Box } from '@components/Box';
import { BasicTextField } from '@components/fields/BasicTextField';
import { effectiveGroupName } from '@components/FormattedGroupName';
import { usePropose } from '@features/execute/ProposeProvider';
import { useSafe } from '@features/safe/SafeProvider';
import { useNavigation } from '@react-navigation/native';
import { AcceptIcon, AddIcon, DeleteIcon, RejectIcon } from '@util/icons';
import { createRemoveGroupOp } from 'lib';
import { useState } from 'react';
import { Appbar, useTheme } from 'react-native-paper';
import { useUpsertApiGroup } from '~/mutations/group/useUpsertApiGroup';
import { CombinedGroup } from '~/queries';
import { GroupManagementScreenProps } from './GroupManagementScreen';

export interface GroupAppbarProps {
  group: CombinedGroup;
}

export const GroupAppbar = ({ group }: GroupAppbarProps) => {
  const navigation = useNavigation<GroupManagementScreenProps['navigation']>();
  const { colors } = useTheme();
  const { safe } = useSafe();
  const propose = usePropose();
  const upsertApiGroup = useUpsertApiGroup();

  const addApprover = () =>
    navigation.navigate('Contacts', {
      disabledAddrs: group.approvers.map((a) => a.addr),
      target: { route: 'GroupManagement', output: 'selected' },
    });

  const deleteGroup = () => propose(createRemoveGroupOp(safe, group));

  const [name, setName] = useState(group.name);

  const saveName = () => {
    upsertApiGroup({
      ...group,
      name,
    });
  };

  return (
    <Appbar.Header>
      <AppbarBack />

      <Box flex={1}>
        <BasicTextField
          value={name}
          onChangeText={setName}
          placeholder={effectiveGroupName(group)}
        />
      </Box>

      {name === group.name ? (
        <>
          <Appbar.Action
            icon={AddIcon}
            onPress={addApprover}
            color={colors.onSurface}
          />
          <Appbar.Action
            icon={DeleteIcon}
            onPress={deleteGroup}
            color={colors.onSurface}
          />
        </>
      ) : (
        <>
          <Appbar.Action
            icon={AcceptIcon}
            color={colors.onSurface}
            onPress={saveName}
          />
          <Appbar.Action
            icon={RejectIcon}
            color={colors.onSurface}
            onPress={() => setName(group.name)}
          />
        </>
      )}
    </Appbar.Header>
  );
};
