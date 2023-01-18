import {
  AddIcon,
  CheckIcon,
  NameIcon,
  ViewProposalIcon,
  RemoveIcon,
  SpendingIcon,
  UndoIcon,
} from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Quorum, QuorumGuid } from 'lib';
import _ from 'lodash';
import { useState } from 'react';
import { FlatList } from 'react-native';
import { Button, Menu, Provider, useTheme } from 'react-native-paper';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { AppbarLarge } from '~/components/Appbar/AppbarLarge';
import { AppbarMore2 } from '~/components/Appbar/AppbarMore';
import { Fab } from '~/components/buttons/Fab';
import { Box } from '~/components/layout/Box';
import { ListItem } from '~/components/list/ListItem';
import { useRemoveQuorum } from '~/mutations/quorum/useRemoveQuorum.api';
import { useUpdateQuorum } from '~/mutations/quorum/useUpdateQuorum.api';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Proposable } from '~/queries/quroum';
import { useConfirmDiscard, useConfirmRemoval } from '../alert/useConfirm';
import { ApproverItem } from './ApproverItem';
import { QuorumStatesSheet } from './states/QuorumStatesSheet';
import { useNavigation } from '@react-navigation/native';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { QuorumDraftProvider, useQuorumDraft } from './QuorumDraftProvider';
import { useSelectContact } from '../contacts/useSelectContact';
import { ListHeader } from '~/components/list/ListHeader';

export interface QuorumScreenParams {
  quorum: QuorumGuid;
  initState?: Proposable<Quorum>;
}

export type QuorumScreenProps = StackNavigatorScreenProps<'Quorum'>;

export const QuorumScreen = withSkeleton(
  ({ route: { params } }: QuorumScreenProps) => (
    <QuorumDraftProvider {...params}>
      <Screen />
    </QuorumDraftProvider>
  ),
  ScreenSkeleton,
);

function Screen() {
  const styles = useStyles();
  const { navigate, goBack } = useNavigation();
  const { quorum, initState, state, updateState } = useQuorumDraft();
  const updateQuorum = useUpdateQuorum(quorum);
  const removeQuorum = useRemoveQuorum(quorum);
  const selectContact = useSelectContact();
  const confirmDiscard = useConfirmDiscard();
  const confirmRemove = useConfirmRemoval({
    message: 'Are you sure you want to propose to remove this quorum?',
  });

  const isActive = _.isEqual(state, quorum.active);
  const isModified = !_.isEqual(state, initState);

  const [sheetShown, setSheetShown] = useState(false);

  const addApprover = async () => {
    const contact = await selectContact({ disabled: state.approvers });
    updateState((s) => {
      s.approvers.add(contact.addr);
    });
    goBack();
  };

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
          trailing={[
            (props) =>
              isModified ? <UndoIcon {...props} onPress={() => updateState(initState)} /> : null,
            (iconProps) => (
              <AppbarMore2 iconProps={iconProps}>
                {({ close }) => (
                  <Menu.Item
                    leadingIcon={(props) => <RemoveIcon {...props} {...iconProps} />}
                    title="Remove quorum"
                    onPress={() => {
                      confirmRemove({
                        onConfirm: async () => {
                          // No proposal is provided if the state isn't active
                          const { removeProposal } = await removeQuorum();
                          removeProposal
                            ? navigate('Proposal', { proposal: removeProposal })
                            : goBack();
                        },
                      });
                      close();
                    }}
                  />
                )}
              </AppbarMore2>
            ),
          ]}
          headline={quorum.name}
          center
        />

        <FlatList
          data={[...state.approvers]}
          ListHeaderComponent={
            <>
              {!isActive && initState.proposal && (
                <Button
                  mode="contained"
                  icon={ViewProposalIcon}
                  style={styles.proposalButton}
                  onPress={() => navigate('Proposal', { proposal: initState.proposal! })}
                >
                  Proposal
                </Button>
              )}

              {(isModified || quorum.proposals.length + Number(quorum.account) > 1) && (
                <ListItem
                  leading={ViewProposalIcon}
                  headline="Change proposals"
                  supporting="Select quorum change proposal"
                  onPress={() => setSheetShown((v) => !v)}
                />
              )}

              <ListItem
                leading={SpendingIcon}
                headline="Spending"
                supporting="Manage token spending limits"
                onPress={() => navigate('QuorumSpending', {})}
              />

              <ListItem
                leading={NameIcon}
                headline="Rename"
                supporting="Change the name of the quorum"
                onPress={() => navigate('RenameQuorum', { quorum })}
              />

              <ListHeader>Approvers</ListHeader>
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
        />
      </Box>

      {!isModified ? (
        <Fab icon={AddIcon} label="Approver" onPress={addApprover} />
      ) : (
        <>
          <Fab
            icon={AddIcon}
            size="small"
            variant="tertiary"
            style={styles.secondaryFab}
            onPress={addApprover}
          />

          <Fab
            icon={CheckIcon}
            label="Propose"
            onPress={async () => {
              const { updateProposal } = await updateQuorum(state);
              navigate('Quorum', { quorum, initState: { ...state, proposal: updateProposal } });
            }}
          />
        </>
      )}

      <QuorumStatesSheet
        {...{ quorum, proposedState: initState, setState: updateState, sheetShown, setSheetShown }}
      />
    </Provider>
  );
}

const useStyles = makeStyles(({ s }) => ({
  proposalButton: {
    alignSelf: 'center',
    marginBottom: s(24),
  },
  secondaryFab: {
    marginBottom: 88,
  },
}));
