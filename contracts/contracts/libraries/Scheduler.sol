// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.20;

struct Schedule {
  uint32 timestamp; /// @dev Overlfows on 2106/02/07
  bool executed;
}

library Scheduler {
  event Scheduled(bytes32 proposal, uint32 timestamp);
  event ScheduleCancelled(bytes32 proposal);

  error NotScheduled(bytes32 proposal);
  error NotScheduledYet(bytes32 proposal, uint32 timestamp);

  function schedule(bytes32 proposal, uint32 timestamp) internal {
    _scheduled()[proposal] = Schedule({timestamp: timestamp, executed: false});
    emit Scheduled(proposal, timestamp);
  }

  function consume(bytes32 proposal) internal {
    Schedule storage s = _scheduled()[proposal];

    if (s.timestamp == 0 || s.executed) revert NotScheduled(proposal);

    // block.timestamp isn't available during verification, see https://docs.zksync.io/build/developer-reference/account-abstraction.html#what-could-be-allowed-in-the-future
    // if (block.timestamp < timestamp) revert NotScheduledYet(proposal, timestamp);

    s.executed = true;
  }

  function requireReady(bytes32 proposal) internal {
    uint32 timestamp = _scheduled()[proposal].timestamp;
    if (block.timestamp < timestamp) revert NotScheduledYet(proposal, timestamp);
    delete _scheduled()[proposal];
  }

  function cancel(bytes32 proposal) internal {
    delete _scheduled()[proposal];
    emit ScheduleCancelled(proposal);
  }

  function getSchedule(bytes32 proposal) internal view returns (uint32) {
    return _scheduled()[proposal].timestamp;
  }

  /*//////////////////////////////////////////////////////////////
                                STORAGE
  //////////////////////////////////////////////////////////////*/

  function _scheduled() private pure returns (mapping(bytes32 => Schedule) storage s) {
    assembly {
      // keccack256('Scheduler.scheduled')
      s.slot := 0x7a81838ee1d2d55d040ef92fa46a2bc4f9afa4c0e8adae71b5b797e5dab5146f
    }
  }
}
