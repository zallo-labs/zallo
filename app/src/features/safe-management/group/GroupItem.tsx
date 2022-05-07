import { GroupName } from '@components/GroupName';
import { Identicon, IDENTICON_SIZE } from '@components/Identicon';
import { ListItem } from '@components/ListItem';
import { MaterialIcons } from '@expo/vector-icons';
import { Group } from '@queries';
import { ethers } from 'ethers';
import { Subheading, useTheme } from 'react-native-paper';

export interface GroupItemProps {
  group: Group;
}

export const GroupItem = ({ group }: GroupItemProps) => {
  const { colors } = useTheme();

  return (
    <ListItem
      Left={<Identicon seed={ethers.utils.hexlify(group.hash)} />}
      Main={
        <Subheading>
          <GroupName group={group} />
        </Subheading>
      }
      Right={
        <MaterialIcons
          name="chevron-right"
          size={IDENTICON_SIZE}
          color={colors.onSurface}
        />
      }
    />
  );
};
