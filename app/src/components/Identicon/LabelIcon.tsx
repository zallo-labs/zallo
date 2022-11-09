import { useTheme } from '@theme/paper';
import { useMemo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Avatar } from 'react-native-paper';

export interface LabelIconProps {
  label: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const LabelIcon = ({ label: l, size, style }: LabelIconProps) => {
  const { iconSize } = useTheme();

  const label = useMemo(() => l.slice(0, Math.min(l?.length, 1)).toUpperCase(), [l]);

  return <Avatar.Text size={size ?? iconSize.medium} label={label} style={style} />;
};
