import { ChainIcon } from '#/Identicon/ChainIcon';
import { SelectEntry } from '#/fields/SelectChip';
import { CHAINS, Chain } from 'chains';
import _ from 'lodash';

export const SUPPORTED_CHAINS = _.pick(CHAINS, [
  'zksync-sepolia',
  'zksync-goerli',
] satisfies Chain[]);

export const CHAIN_ENTRIES = Object.values(SUPPORTED_CHAINS).map(
  (c) =>
    ({
      title: c.name,
      value: c.key,
      icon: (props) => <ChainIcon {...props} chain={props.value} />,
    }) satisfies SelectEntry<Chain>,
);
