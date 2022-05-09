import { Subheading, useTheme } from 'react-native-paper';
import { IDENTICON_SIZE } from '@components/Identicon';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ListItem } from './ListItem';

export const AddItem = () => {
  const { colors } = useTheme();

  return (
    <ListItem
      Left={
        <MaterialCommunityIcons
          name="plus"
          size={IDENTICON_SIZE}
          color={colors.onSurface}
        />
      }
      Main={<Subheading>Add</Subheading>}
    />
  );
};
