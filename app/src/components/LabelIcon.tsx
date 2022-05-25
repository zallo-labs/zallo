import { PRIMARY_ICON_SIZE } from './list/Item';
import { useMemo } from 'react';
import { Avatar } from 'react-native-paper';

export interface LabelIconProps {
  label?: string;
}

export const LabelIcon = ({ label: l }: LabelIconProps) => {
  const label = useMemo(
    () => l?.slice(0, Math.min(l?.length, 2)).toUpperCase() ?? '',
    [l],
  );

  return <Avatar.Text size={PRIMARY_ICON_SIZE} label={label} />;
};
