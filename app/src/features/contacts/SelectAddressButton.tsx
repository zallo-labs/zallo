import { Paragraph, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Box } from '@components/Box';
import { Item, ItemProps, PRIMARY_ICON_SIZE } from '@components/list/Item';
import { Address, tryAddress } from 'lib';

export interface SelectAddressButtonProps extends ItemProps {
  input: string;
  select: (addr: Address) => void;
}

export const SelectAddressButton = ({
  input,
  select,
  ...itemProps
}: SelectAddressButtonProps) => {
  const { colors } = useTheme();

  // Only select button if it's a valid address
  const addr = tryAddress(input);
  // if (!addr) return null;

  return (
    <Item
      Left={
        <MaterialCommunityIcons
          name="check-circle"
          color={colors.primary}
          size={PRIMARY_ICON_SIZE * 0.8}
        />
      }
      leftContainer={{
        width: PRIMARY_ICON_SIZE,
        alignItems: 'flex-end',
      }}
      Main={
        <Paragraph style={{ color: colors.primary }}>Select address</Paragraph>
      }
      onPress={() => select(addr)}
      {...itemProps}
    />
  );
};
