import { PersonIcon, DownArrowIcon } from '@theme/icons';
import { Chip } from 'react-native-paper';

export interface ConfigSelectorChipProps {}

export const ConfigSelectorChip = (props: ConfigSelectorChipProps) => {
  return (
    <Chip
      elevated
      icon={PersonIcon}
      closeIcon={DownArrowIcon}
      onClose={() => {
        // Required for the closeIcon to show
      }}
    >
      2 approvers
    </Chip>
  );
};
