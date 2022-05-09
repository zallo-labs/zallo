import { ethers } from 'ethers';
import { Paragraph } from 'react-native-paper';
import { Box } from '@components/Box';
import { RootStackScreenProps } from '@features/navigation/RootNavigation';
import { Header } from '@components/Header';
import { elipseTruncate } from '@util/format';
import { Identicon } from '@components/Identicon';
import { GroupNameField } from './GroupNameField';
import { useGroup } from '@features/safe/SafeProvider';
import { ApproverItems } from './approver/ApproverItems';

export interface GroupManagementScreenParams {
  groupId?: string;
}

export type GroupManagementScreenProps =
  RootStackScreenProps<'GroupManagement'>;

export const GroupManagementScreen = ({
  route,
}: GroupManagementScreenProps) => {
  const { groupId } = route.params;
  const group = useGroup(groupId);

  const shortAddr = elipseTruncate(ethers.utils.hexlify(group.hash), 6, 4);

  return (
    <Box flex={1}>
      <Box mx="5%" mt="5%">
        <Header
          middle={<Paragraph>{shortAddr}</Paragraph>}
          right={<Identicon seed={group.hash} />}
        />

        <Box mt="25%">
          <GroupNameField group={group} />
        </Box>
      </Box>

      <Box mt="25%">
        <ApproverItems group={group} />
      </Box>
    </Box>
  );
};
