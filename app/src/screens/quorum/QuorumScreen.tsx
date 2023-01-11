import {
  AddIcon,
  NameIcon,
  ProposedModifyIcon,
  ProposeIcon,
  RemoveIcon,
  SpendingIcon,
  UndoIcon,
} from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Quorum, QuorumGuid } from 'lib';
import _ from 'lodash';
import { useState } from 'react';
import { FlatList } from 'react-native';
import { Button, Menu, Provider, Text, useTheme } from 'react-native-paper';
import { useImmer } from 'use-immer';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { AppbarLarge } from '~/components/Appbar/AppbarLarge';
import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { Fab } from '~/components/Fab/Fab';
import { FabGroup } from '~/components/Fab/FabGroup';
import { Box } from '~/components/layout/Box';
import { ListItem } from '~/components/ListItem/ListItem';
import { useRemoveQuorum } from '~/mutations/quorum/useRemoveQuorum.api';
import { useUpdateQuorum } from '~/mutations/quorum/useUpdateQuorum.api';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Proposable } from '~/queries/quroum';
import { useQuorum } from '~/queries/quroum/useQuorum.api';
import { useConfirmDelete, useConfirmDiscard } from '../alert/useConfirm';
import { ApproverItem } from './ApproverItem';
import { QuorumStatesSheet } from './states/QuorumStatesSheet';

export type QuorumScreenParams = {
  quorum: QuorumGuid;
  proposedState?: Proposable<Quorum>;
};

export type QuorumScreenProps = StackNavigatorScreenProps<'Quorum'>;

export const QuorumScreen = ({
  route: { params },
  navigation: { navigate, goBack },
}: QuorumScreenProps) => {
  const styles = useStyles();
  const quorum = useQuorum(params.quorum);
  const updateQuorum = useUpdateQuorum(quorum);
  const confirmDiscard = useConfirmDiscard();
  const confirmRemove = useConfirmDelete({
    title: 'Remove?',
    message: 'Are you sure you want to propose to remove this quorum?',
    confirmLabel: 'Remove',
    onConfirm: useRemoveQuorum(quorum),
  });

  const proposedState = params.proposedState ?? quorum.activeOrLatest;
  const [state, updateState] = useImmer(proposedState);
  const isActive = _.isEqual(state, quorum.active);
  const isModified = !_.isEqual(state, proposedState);

  const [sheetShown, setSheetShown] = useState(false);

  return (
    <Provider theme={useTheme()}>
      <Box flex={1}>
        <AppbarLarge
          leading={(props) => (
            <AppbarBack2
              {...props}
              onPress={(goBack) => confirmDiscard({ onConfirm: goBack, enabled: isModified })}
            />
          )}
          // trailing={(props) => <RemoveIcon {...props} onPress={() => confirmRemove({})} />}
          trailing={(iconProps) => (
            <AppbarMore iconProps={iconProps}>
              {({ close }) => (
                <Menu.Item
                  leadingIcon={(props) => <RemoveIcon {...props} {...iconProps} />}
                  title="Remove quorum"
                  onPress={() => {
                    confirmRemove({});
                    close();
                  }}
                />
              )}
            </AppbarMore>
          )}
          headline={quorum.name}
          center
        />

        <FlatList
          data={[...state.approvers]}
          ListHeaderComponent={
            <>
              {!isActive && proposedState.proposal && (
                <Button
                  mode="contained"
                  icon={ProposedModifyIcon}
                  style={styles.proposalButton}
                  onPress={() => navigate('Proposal', { proposal: proposedState.proposal! })}
                >
                  Proposal
                </Button>
              )}

              {(isModified || quorum.proposals.length + Number(quorum.account) > 1) && (
                <ListItem
                  leading={ProposedModifyIcon}
                  headline="Change proposals"
                  supporting="Select quorum change proposal"
                  onPress={() => setSheetShown((v) => !v)}
                />
              )}

              <ListItem
                leading={SpendingIcon}
                headline="Spending"
                supporting="Manage token spending limits"
                onPress={() => {
                  // TODO: navigate('QuorumSpending', ...);
                }}
              />

              <ListItem
                leading={NameIcon}
                headline="Rename"
                supporting="Change the name of the quorum"
                onPress={() => navigate('RenameQuorum', { quorum })}
              />

              <Text variant="bodyLarge" style={styles.approversHeader}>
                Approvers
              </Text>
            </>
          }
          renderItem={({ item }) => (
            <ApproverItem
              approver={item}
              onRemove={() =>
                updateState((s) => {
                  s.approvers.delete(item);
                })
              }
            />
          )}
          ListFooterComponent={
            <Button
              icon={AddIcon}
              style={styles.addApproverButton}
              onPress={() =>
                navigate('Contacts', {
                  title: 'Add approver',
                  disabled: state.approvers,
                  onSelect: (contact) => {
                    updateState((s) => {
                      s.approvers.add(contact.addr);
                    });
                    goBack();
                  },
                })
              }
            >
              Add approver
            </Button>
          }
        />
      </Box>

      {isModified && (
        <>
          <Fab
            icon={UndoIcon}
            size="small"
            variant="secondary"
            style={styles.undoFab}
            onPress={() => updateState(proposedState)}
          />

          <Fab icon={ProposeIcon} label="Propose changes" onPress={() => updateQuorum(state)} />
        </>
      )}

      <QuorumStatesSheet
        {...{ quorum, proposedState, setState: updateState, sheetShown, setSheetShown }}
      />
    </Provider>
  );
};

const useStyles = makeStyles(({ s, colors }) => ({
  proposalButton: {
    alignSelf: 'center',
    marginBottom: s(24),
  },
  approversHeader: {
    color: colors.onSurfaceVariant,
    marginHorizontal: s(16),
    marginVertical: s(8),
  },
  addApproverButton: {
    alignSelf: 'flex-end',
    marginHorizontal: s(16),
  },
  undoFab: {
    marginBottom: 88,
  },
}));
