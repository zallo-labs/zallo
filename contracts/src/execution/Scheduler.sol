// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

struct Schedule {
  uint64 timestamp; /// @dev Overlfows on 21/7/2554
  bool executed;
}

library Scheduler {
  event Scheduled(bytes32 proposal, uint64 timestamp);
  event ScheduleCancelled(bytes32 proposal);

  error NotScheduled(bytes32 proposal);
  error AlreadyExecuted(bytes32 proposal);
  error NotScheduledYet(bytes32 proposal, uint64 timestamp);

  function schedule(bytes32 proposal, uint64 timestamp) internal {
    _scheduled()[proposal].timestamp = timestamp;
    emit Scheduled(proposal, timestamp);
  }

  function consume(bytes32 proposal) internal {
    Schedule storage s = _scheduled()[proposal];

    // block.timestamp isn't available during verification, see https://docs.zksync.io/build/developer-reference/account-abstraction.html#what-could-be-allowed-in-the-future
    // if (block.timestamp < timestamp) revert NotScheduledYet(proposal, timestamp);

    if (s.timestamp == 0) revert NotScheduled(proposal);
    if (s.executed) revert AlreadyExecuted(proposal);

    s.executed = true;
  }

  function requireReady(bytes32 proposal) internal {
    uint64 timestamp = _scheduled()[proposal].timestamp;
    if (block.timestamp < timestamp) revert NotScheduledYet(proposal, timestamp);
    delete _scheduled()[proposal];
  }

  function cancel(bytes32 proposal) internal {
    delete _scheduled()[proposal];
    emit ScheduleCancelled(proposal);
  }

  function getSchedule(bytes32 proposal) internal view returns (uint64) {
    return _scheduled()[proposal].timestamp;
  }

  /*//////////////////////////////////////////////////////////////
                                STORAGE
  //////////////////////////////////////////////////////////////*/

  function _scheduled() private pure returns (mapping(bytes32 => Schedule) storage s) {
    assembly ('memory-safe') {
      // keccack256('Scheduler.scheduled')
      s.slot := 0x7a81838ee1d2d55d040ef92fa46a2bc4f9afa4c0e8adae71b5b797e5dab5146f
    }
  }
}
