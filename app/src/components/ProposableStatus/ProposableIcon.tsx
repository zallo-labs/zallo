import {
  IconPropsWithoutName,
  ProposedAddIcon,
  ProposedModifyIcon,
  ProposedRemoveIcon,
} from '@theme/icons';
import { useTheme } from '@theme/paper';
import { getProposableStatus, Proposable } from '~/gql/proposable';

const ICON = {
  modify: ProposedModifyIcon,
  add: ProposedAddIcon,
  remove: ProposedRemoveIcon,
} as const;

interface ProposableIconProps extends IconPropsWithoutName {
  proposable: Proposable<unknown>;
}

export const ProposableIcon = ({
  proposable: p,
  ...iconProps
}: ProposableIconProps) => {
  const { colors, iconSize } = useTheme();

  const status = getProposableStatus(p);
  if (status === 'active') return null;

  const Icon = ICON[status];
  return <Icon color={colors.onSurface} size={iconSize.small} {...iconProps} />;
};
