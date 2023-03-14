import { RemoveIcon } from '@theme/icons';
import { Appbar, Menu } from 'react-native-paper';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { ProposalId, useRemoveProposal } from '@api/proposal';
import { useConfirmRemoval } from '../alert/useConfirm';
import { useNavigation } from '@react-navigation/native';

export interface ProposalAppbarProps {
  proposal: ProposalId;
}

export const ProposalAppbar = ({ proposal }: ProposalAppbarProps) => {
  const { goBack } = useNavigation();
  const removeProposal = useRemoveProposal();
  const confirmRemove = useConfirmRemoval({
    message: 'Are you sure you want to remove this proposal?',
  });

  return (
    <Appbar.Header>
      <AppbarBack />
      <Appbar.Content title="" />
      <AppbarMore>
        {({ close }) => (
          <Menu.Item
            leadingIcon={RemoveIcon}
            title="Remove proposal"
            onPress={() => {
              close();
              confirmRemove({
                onConfirm: () => {
                  removeProposal(proposal);
                  goBack();
                },
              });
            }}
          />
        )}
      </AppbarMore>
    </Appbar.Header>
  );
};
