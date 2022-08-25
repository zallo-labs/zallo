import { IconPropsWithoutName, materialCommunityIcon } from '@theme/icons';
import { useTheme } from '@theme/paper';
import { ProposableState } from '~/queries/wallets';

const ICON = {
  active: materialCommunityIcon('clock-outline'),
  add: materialCommunityIcon('clock-plus-outline'),
  remove: materialCommunityIcon('clock-remove-outline'),
} as const;

interface ProposableStatusIconProps extends IconPropsWithoutName {
  state: ProposableState;
}

export const ProposableStatusIcon = ({
  state,
  ...iconProps
}: ProposableStatusIconProps) => {
  const { colors, iconSize } = useTheme();

  if (state.status === 'active' && !state.proposedModification) return null;

  const Icon = ICON[state.status];
  return <Icon color={colors.onSurface} size={iconSize.small} {...iconProps} />;
};
