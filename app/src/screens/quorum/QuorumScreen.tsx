import { Box } from '@components/Box';
import { CheckIcon, DeleteIcon, EditIcon, PlusIcon } from '@util/theme/icons';
import { useTheme } from '@util/theme/paper';
import { Address, Quorum, toQuorum } from 'lib';
import { FlatList } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { useGoBack } from '~/components2/Appbar/useGoBack';
import { AddrCard } from '~/components2/addr/AddrCard';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { CombinedQuorum } from '~/queries/wallets';
import { useMemo, useState } from 'react';
import _ from 'lodash';
import { FAB } from '~/components2/FAB';
import { BottomAppbar } from '~/components2/Appbar/BottomAppbar';

export interface QuorumScreenParams {
  quorum?: CombinedQuorum;
  onChange: (quorum?: CombinedQuorum) => void;
}

export type QuorumScreenProps = RootNavigatorScreenProps<'Quorum'>;

export const QuorumScreen = ({ route, navigation }: QuorumScreenProps) => {
  const { onChange, quorum = { approvers: [] as unknown as Quorum } } =
    route.params;
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const { colors, space } = useTheme();

  const [approvers, setApprovers] = useState<Quorum>(quorum.approvers);
  const [selected, setSelected] = useState<Address | undefined>(undefined);

  const isModified = useMemo(
    () => !_.isEqual(approvers, quorum.approvers),
    [approvers, quorum.approvers],
  );

  const addApprover = () =>
    navigation.navigate('Contacts', {
      disabled: approvers,
      onSelect: (contact) =>
        setApprovers(toQuorum([...approvers, contact.addr])),
    });

  const deleteQuorum = () => {
    onChange(undefined);
    navigation.goBack();
  };

  const replaceSelectedApprover = () =>
    navigation.navigate('Contacts', {
      disabled: approvers,
      onSelect: (contact) =>
        setApprovers(
          toQuorum([...approvers.filter((a) => a !== selected), contact.addr]),
        ),
    });

  const removeSelectedApprover = () => {
    setApprovers(toQuorum(approvers.filter((a) => a !== selected)));
    setSelected(undefined);
  };

  const apply = () => {
    onChange({ ...quorum, approvers });
    navigation.goBack();
  };

  return (
    <Box flex={1}>
      <AppbarHeader mode="medium">
        <Appbar.BackAction onPress={useGoBack()} />
        <Appbar.Content title="Quorum" />
        <Appbar.Action icon={PlusIcon} onPress={addApprover} />
        <Appbar.Action icon={DeleteIcon} onPress={deleteQuorum} />
      </AppbarHeader>

      <FlatList
        renderItem={({ item }) => (
          <AddrCard
            addr={item}
            onPress={() =>
              setSelected((prev) => (prev !== item ? item : undefined))
            }
            {...(selected === item && {
              backgroundColor: colors.surfaceVariant,
            })}
          />
        )}
        ItemSeparatorComponent={() => <Box my={2} />}
        style={{ marginHorizontal: space(3) }}
        data={approvers}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
      />

      {selected ? (
        <BottomAppbar>
          <Appbar.Action icon={EditIcon} onPress={replaceSelectedApprover} />
          <Appbar.Action icon={DeleteIcon} onPress={removeSelectedApprover} />

          {isModified && <FAB appbar icon={CheckIcon} onPress={apply} />}
        </BottomAppbar>
      ) : (
        <>
          {isModified && (
            <FAB icon={CheckIcon} label="Accept" onPress={apply} />
          )}
        </>
      )}
    </Box>
  );
};
