import { useTheme } from '@theme/paper';
import { useMemo } from 'react';
import { Avatar, AvatarTextProps } from 'react-native-paper';

export interface LabelIconProps extends Omit<AvatarTextProps, 'theme'> {}

export const LabelIcon = ({ label: l, ...props }: LabelIconProps) => {
  const { iconSize } = useTheme();

  const label = useMemo(() => l.slice(0, Math.min(l?.length, 1)).toUpperCase(), [l]);

  return <Avatar.Text size={iconSize.medium} label={label} {...props} />;
};
