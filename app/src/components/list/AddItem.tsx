import { Subheading, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PRIMARY_ICON_SIZE, Item } from './Item';

export interface AddItemsProps {
  label?: string;
  onPress?: () => void;
}

export const AddItem = ({ label, onPress }: AddItemsProps) => {
  const { colors } = useTheme();

  return (
    <Item
      Left={
        <MaterialCommunityIcons
          name="plus"
          size={PRIMARY_ICON_SIZE}
          color={colors.accent}
        />
      }
      Main={
        <Subheading style={{ color: colors.accent }}>
          {label ?? 'Add'}
        </Subheading>
      }
      onPress={onPress}
    />
  );
};
