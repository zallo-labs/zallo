import _ from 'lodash';

import { Chain, CHAINS } from 'chains';

export const SUPPORTED_CHAINS = _.omit(CHAINS, ['zksync-local' satisfies Chain]);
