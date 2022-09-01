import { IconPropsWithoutName, materialCommunityIcon } from '@theme/icons';
import { useTheme } from '@theme/paper';
import { getProposableStatus, Proposable } from '~/gql/proposable';

const ICON = {
  active: materialCommunityIcon('clock-outline'),
  add: materialCommunityIcon('clock-plus-outline'),
  remove: materialCommunityIcon('clock-remove-outline'),
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
  if (status === 'active' && !p.proposal) return null;

  const Icon = ICON[status];
  return <Icon color={colors.onSurface} size={iconSize.small} {...iconProps} />;
};
