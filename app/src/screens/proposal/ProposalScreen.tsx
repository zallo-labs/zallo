import { ProposalId, useProposal, useRemoveProposal } from '@api/proposal';
import { Menu } from 'react-native-paper';
import { Appbar } from '~/components/Appbar/Appbar';
import { AppbarMore2 } from '~/components/Appbar/AppbarMore';
import { Screen } from '~/components/layout/Screen';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useConfirmRemoval } from '../alert/useConfirm';
import { Tabs } from './Tabs';
import { ProposalActions } from './ProposalActions';
import { useAddressLabel } from '~/components/address/AddressLabel';

export interface ProposalScreenParams {
  proposal: ProposalId;
}

export type ProposalScreenProps = StackNavigatorScreenProps<'Proposal'>;

export const ProposalScreen = withSuspense(
  ({ route, navigation: { goBack } }: ProposalScreenProps) => {
    const proposal = useProposal(route.params.proposal);
    const removeProposal = useRemoveProposal();
    const confirmRemoval = useConfirmRemoval({
      message: 'Are you sure you want to remove this proposal?',
    });

    return (
      <Screen>
        <Appbar
          mode="small"
          leading="back"
          headline={useAddressLabel(proposal.account)}
          trailing={(props) => (
            <AppbarMore2 iconProps={props}>
              {({ close }) => (
                <Menu.Item
                  title="Remove proposal"
                  onPress={() => {
                    close();
                    confirmRemoval({
                      onConfirm: () => {
                        removeProposal(proposal.hash);
                        goBack();
                      },
                    });
                  }}
                />
              )}
            </AppbarMore2>
          )}
        />

        <Tabs proposal={proposal.hash} />

        <ProposalActions proposal={proposal} />
      </Screen>
    );
  },
  ScreenSkeleton,
);
