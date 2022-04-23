import { FC } from 'react';
import { Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { Box } from '@components/Box';
import { showError } from '@components/Toast';

interface IconProps {
  size: number;
  color: string;
}

export interface HomeActionButtonProps {
  label: string;
  icon: FC<IconProps>;
  onClick: () => void;
  disabled?: boolean | string;
}

export const HomeActionButton = ({
  icon: Icon,
  label,
  onClick: onClickProp,
  disabled,
}: HomeActionButtonProps) => {
  const { colors } = useTheme();

  const color = disabled ? colors.placeholder : colors.primary;

  const onClick = () => {
    if (!disabled) {
      onClickProp();
    } else if (typeof disabled === 'string') {
      showError({ text1: disabled });
    }
  };

  return (
    <Box mx={2}>
      <Pressable onPress={onClick}>
        <Box vertical center>
          <Icon size={30} color={color} />

          <Box mt={2}>
            <Text style={{ color }}>{label}</Text>
          </Box>
        </Box>
      </Pressable>
    </Box>
  );
};
