import { AppbarBack } from '@components/AppbarBack';
import { Box } from '@components/Box';
import { BasicTextField } from '@components/fields/BasicTextField';
import { effectiveGroupName } from '@components/GroupName';
import { usePropose } from '@features/execute/ProposeProvider';
import { useAccount } from '@features/account/AccountProvider';
import { useNavigation } from '@react-navigation/native';
import { AcceptIcon, AddIcon, DeleteIcon, RejectIcon } from '@util/theme/icons';
import { createRemoveGroupTx } from 'lib';
import { useMemo, useState } from 'react';
import { Keyboard } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useUpsertApiWallet } from '~/mutations/wallet/useUpsertWallet.api';
import { CombinedWallet } from '~/queries/wallets';
import { GroupManagementScreenProps } from './GroupManagementScreen';

export interface GroupAppbarProps {
  group: CombinedWallet;
}

export const GroupAppbar = ({ group }: GroupAppbarProps) => {
  const navigation = useNavigation<GroupManagementScreenProps['navigation']>();
  const { colors } = useTheme();
  const { contract: account, groups } = useAccount();
  const propose = usePropose();
  const upsertApiGroup = useUpsertApiWallet();

  const isExisting = useMemo(
    () => !!groups.find((g) => g.id === group.id),
    [groups, group.id],
  );

  const addApprover = () =>
    navigation.navigate('Contacts', {
      disabledAddrs: group.approvers.map((a) => a.addr),
      target: { route: 'GroupManagement', output: 'selected' },
    });

  const deleteGroup = () => propose(createRemoveGroupTx(account, group));

  const [name, setName] = useState(group.name);

  const acceptName = () => {
    upsertApiGroup({
      ...group,
      name,
    });
    Keyboard.dismiss();
  };

  const rejectName = () => {
    setName(group.name);
    Keyboard.dismiss();
  };

  return (
    <Appbar.Header>
      <AppbarBack />

      {isExisting ? (
        <Box flex={1}>
          <BasicTextField
            value={name}
            onChangeText={setName}
            placeholder={effectiveGroupName(group)}
          />
        </Box>
      ) : (
        <Appbar.Content title="Create group" />
      )}

      {name === group.name ? (
        <>
          <Appbar.Action
            icon={AddIcon}
            onPress={addApprover}
            color={colors.onSurface}
          />
          {isExisting && (
            <Appbar.Action
              icon={DeleteIcon}
              onPress={deleteGroup}
              color={colors.onSurface}
            />
          )}
        </>
      ) : (
        <>
          <Appbar.Action
            icon={AcceptIcon}
            color={colors.onSurface}
            onPress={acceptName}
          />
          <Appbar.Action
            icon={RejectIcon}
            color={colors.onSurface}
            onPress={rejectName}
          />
        </>
      )}
    </Appbar.Header>
  );
};
