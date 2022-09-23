import { useMemo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Avatar, useTheme } from 'react-native-paper';

export interface LabelIconProps {
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export const LabelIcon = ({ label: l, style }: LabelIconProps) => {
  const { iconSize } = useTheme();

  const label = useMemo(
    () => l?.slice(0, Math.min(l?.length, 2)).toUpperCase() ?? '',
    [l],
  );

  return <Avatar.Text size={iconSize.medium} label={label} style={style} />;
};
