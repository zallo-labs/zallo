import { Paragraph, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Item, ItemProps } from '@components/list/Item';
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
  const { colors, iconSize } = useTheme();

  // Only select button if it's a valid address
  const addr = tryAddress(input);
  if (!addr) return null;

  return (
    <Item
      Left={
        <MaterialCommunityIcons
          name="check-circle"
          color={colors.primary}
          size={iconSize.medium * 0.8}
        />
      }
      leftContainer={{
        width: iconSize.medium,
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
