import {
  IconPropsWithoutName,
  ProposedAddIcon,
  ProposedModifyIcon,
  ProposedRemoveIcon,
} from '@theme/icons';
import { useTheme } from '@theme/paper';
import { Proposable } from '~/gql/proposable';

const ICON = {
  modify: ProposedModifyIcon,
  add: ProposedAddIcon,
  remove: ProposedRemoveIcon,
} as const;

interface ProposableIconProps extends IconPropsWithoutName {
  proposable: Proposable<unknown>;
}

export const ProposableIcon = ({ proposable: p, ...iconProps }: ProposableIconProps) => {
  const { colors, iconSize } = useTheme();

  if (p.status === 'active') return null;

  const Icon = ICON[p.status];
  return <Icon color={colors.onSurface} size={iconSize.small} {...iconProps} />;
};
