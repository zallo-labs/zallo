import { CHAINS, Chain } from 'chains';
import _ from 'lodash';

export const SUPPORTED_CHAINS = _.pick(CHAINS, [
  'zksync-sepolia',
  'zksync-goerli',
] satisfies Chain[]);
