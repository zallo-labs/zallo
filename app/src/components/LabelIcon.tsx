import { useMemo } from 'react';
import { Avatar, useTheme } from 'react-native-paper';

export interface LabelIconProps {
  label?: string;
}

export const LabelIcon = ({ label: l }: LabelIconProps) => {
  const { iconSize } = useTheme();

  const label = useMemo(
    () => l?.slice(0, Math.min(l?.length, 2)).toUpperCase() ?? '',
    [l],
  );

  return <Avatar.Text size={iconSize.medium} label={label} />;
};
