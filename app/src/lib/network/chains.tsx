import { ChainIcon } from '#/Identicon/ChainIcon';
import { SelectEntry } from '#/fields/SelectChip';
import { CHAINS, Chain } from 'chains';
import _ from 'lodash';

export const SUPPORTED_CHAIN_KEYS = ['zksync', 'zksync-sepolia'] satisfies Chain[];
export const SUPPORTED_CHAINS = _.pick(CHAINS, SUPPORTED_CHAIN_KEYS);

export const CHAIN_ENTRIES = Object.values(SUPPORTED_CHAINS).map(
  (c) =>
    ({
      title: c.name,
      value: c.key,
      icon: (props) => <ChainIcon {...props} chain={props.value} />,
    }) satisfies SelectEntry<Chain>,
);
