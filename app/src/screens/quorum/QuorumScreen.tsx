import { Box } from '~/components/layout/Box';
import {
  CheckIcon,
  DeleteIcon,
  EditIcon,
  PlusIcon,
  UndoIcon,
} from '~/util/theme/icons';
import { Address } from 'lib';
import { FlatList } from 'react-native';
import { Appbar, Button } from 'react-native-paper';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useCallback, useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { FAB } from '~/components/FAB';
import { BottomAppbar } from '~/components/Appbar/BottomAppbar';
import { makeStyles } from '~/util/theme/makeStyles';
import { useDeleteConfirmation } from '../alert/DeleteModalScreen';
import { ProposableState } from '~/queries/wallets';
import { AddrCard } from '~/components/addr/AddrCard';
import { ProposableStatusButton } from '~/components/ProposableStatus/ProposableStatusButton';
import { AppbarExtraContent } from '~/components/Appbar/AppbarExtraContent';

export interface QuorumScreenParams {
  approvers?: Address[];
  onChange: (approvers: Address[]) => void;
  removeQuorum?: () => void;
  revertQuorum?: () => void;
  isRemoved?: boolean;
  state: ProposableState;
}

export type QuorumScreenProps = RootNavigatorScreenProps<'Quorum'>;

export const QuorumScreen = ({
  navigation,
  route: {
    params: {
      approvers: initialApprovers,
      onChange,
      removeQuorum,
      revertQuorum,
      state,
    },
  },
}: QuorumScreenProps) => {
  const styles = useStyles();
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const confirmDelete = useDeleteConfirmation();

  const [approvers, setApprovers] = useState(initialApprovers ?? []);
  const [selected, select] = useState<Address | undefined>(undefined);

  const isModified = useMemo(
    () => !_.isEqual(approvers, initialApprovers),
    [approvers, initialApprovers],
  );

  const addApprover = useCallback(
    () =>
      navigation.navigate('Contacts', {
        title: 'Add approver',
        onSelect: (contact) => setApprovers([...approvers, contact.addr]),
        disabled: approvers,
      }),
    [approvers, navigation],
  );

  useEffect(() => {
    if (approvers.length === 0) addApprover();
  }, [addApprover, approvers.length]);

  const replaceSelectedApprover = () => {
    navigation.navigate('Contacts', {
      title: 'Replace approver',
      onSelect: (contact) => {
        setApprovers([
          ...approvers.filter((a) => a !== selected),
          contact.addr,
        ]);
        navigation.goBack();
      },
      disabled: approvers,
    });
    select(undefined);
  };

  const removeSelectedApprover = () => {
    setApprovers((approvers) => approvers.filter((a) => a !== selected));
    select(undefined);
  };

  const apply = () => {
    onChange(approvers);
    navigation.goBack();
  };

  return (
    <Box flex={1}>
      <AppbarHeader mode="medium">
        <Appbar.BackAction onPress={useGoBack()} />

        <Appbar.Content title="Quorum" />

        <AppbarExtraContent>
          <ProposableStatusButton state={state} />
        </AppbarExtraContent>

        {revertQuorum && (
          <Appbar.Action
            icon={UndoIcon}
            onPress={() => {
              revertQuorum();
              navigation.goBack();
            }}
          />
        )}

        {removeQuorum && (
          <Appbar.Action
            icon={DeleteIcon}
            onPress={() =>
              confirmDelete(() => {
                removeQuorum();
                navigation.goBack();
              })
            }
          />
        )}
      </AppbarHeader>

      <FlatList
        renderItem={({ item }) => (
          <AddrCard
            addr={item}
            onPress={() =>
              select((selected) => (selected !== item ? item : undefined))
            }
            {...(selected === item && {
              style: styles.selected,
            })}
          />
        )}
        ItemSeparatorComponent={() => <Box my={2} />}
        ListFooterComponent={
          <Button
            icon={PlusIcon}
            mode="text"
            style={styles.create}
            onPress={addApprover}
          >
            Approver
          </Button>
        }
        style={styles.list}
        data={approvers}
        extraData={[selected, select]}
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

const useStyles = makeStyles(({ colors, space }) => ({
  list: {
    marginHorizontal: space(3),
  },
  create: {
    alignSelf: 'flex-end',
    marginTop: space(2),
  },
  selected: {
    backgroundColor: colors.surfaceVariant,
  },
}));
