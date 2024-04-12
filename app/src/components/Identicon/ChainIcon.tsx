import { IconProps, UnknownOutlineIcon, imageFromSource } from '@theme/icons';
import { Chain } from 'chains';
import { memo } from 'react';

const icons = {
  zksync: imageFromSource(require('assets/zksync.svg')),
  'zksync-sepolia': imageFromSource(require('assets/zksync-sepolia.svg')),
  'zksync-local': UnknownOutlineIcon,
} satisfies Record<Chain, unknown>;

export interface ChainIconProps extends IconProps {
  chain: Chain;
}

function ChainIcon_({ chain, ...props }: ChainIconProps) {
  const Icon = icons[chain];

  return <Icon {...props} />;
}

export const ChainIcon = memo(ChainIcon_);
