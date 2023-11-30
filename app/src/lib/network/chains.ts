import { CHAINS, Chain } from 'chains';
import _ from 'lodash';

export const SUPPORTED_CHAINS = _.omit(CHAINS, ['zksync-local' satisfies Chain]);
