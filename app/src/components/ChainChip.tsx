import { Chain } from 'chains';
import { SelectChip, SelectChipProps } from '~/components/fields/SelectChip';
import { SUPPORTED_CHAINS } from '~/lib/network/chains';
import { ChainIcon } from '~/util/theme/icons';

const entries = Object.values(SUPPORTED_CHAINS).map((c) => [c.name, c.key] as const);

export interface ChainChipProps extends Omit<SelectChipProps<Chain>, 'entries'> {}

export function ChainChip(props: ChainChipProps) {
  return (
    <SelectChip {...props} entries={entries} chipProps={{ icon: ChainIcon, ...props.chipProps }} />
  );
}
