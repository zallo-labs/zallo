// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {Scheduler} from '~/execution/Scheduler.sol';

struct DelayConfig {
  uint32 delay /* seconds */;
}

library DelayHook {
  function beforeExecute(
    bytes32 proposal,
    bytes memory configData
  ) internal returns (bool execute) {
    DelayConfig memory config = abi.decode(configData, (DelayConfig));
    if (config.delay == 0) return true;

    Scheduler.schedule(proposal, uint64(block.timestamp) + config.delay);
    return false;
  }
}
