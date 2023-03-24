import { makeStyles } from '@theme/makeStyles';
import { ReactNode } from 'react';
import { StyleProp, TextStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Text } from 'react-native-paper';

export interface ListHeaderButtonProps extends TouchableOpacityProps {
  children: ReactNode;
  labelStyle?: StyleProp<TextStyle>;
}

export const ListHeaderButton = ({
  children,
  labelStyle,
  ...touchableProps
}: ListHeaderButtonProps) => (
  <TouchableOpacity {...touchableProps}>
    <Text style={[useStyles().label, labelStyle]}>{children}</Text>
  </TouchableOpacity>
);

const useStyles = makeStyles(({ colors }) => ({
  label: {
    color: colors.onSurfaceVariant,
  },
}));
