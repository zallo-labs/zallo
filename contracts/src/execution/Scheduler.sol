// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

struct Schedule {
  uint64 timestamp; /// @dev Overlfows on 21/7/2554
  bool used;
}

library Scheduler {
  event Scheduled(bytes32 proposal, uint64 timestamp);
  event ScheduleCancelled(bytes32 proposal);

  error ZeroScheduleTimestamp(bytes32 proposal);
  error NotScheduled(bytes32 proposal);
  error AlreadyExecuted(bytes32 proposal);
  error NotScheduledYet(bytes32 proposal, uint64 timestamp);

  function schedule(bytes32 proposal, uint64 timestamp) internal {
    if (timestamp == 0) revert ZeroScheduleTimestamp(proposal);

    _scheduled()[proposal].timestamp = timestamp;
    emit Scheduled(proposal, timestamp);
  }

  function validate(bytes32 proposal) internal {
    Schedule storage s = _scheduled()[proposal];

    if (s.timestamp == 0) revert NotScheduled(proposal);
    if (s.used) revert AlreadyExecuted(proposal);

    s.used = true;
  }

  /// @dev Not done during `validate` due to block.timestamp restriction during validation - https://docs.zksync.io/build/developer-reference/account-abstraction.html#what-could-be-allowed-in-the-future
  function setExecuted(bytes32 proposal) internal {
    uint64 timestamp = _scheduled()[proposal].timestamp;
    if (timestamp == 0) revert NotScheduled(proposal);
    if (block.timestamp < timestamp) revert NotScheduledYet(proposal, timestamp);

    delete _scheduled()[proposal];
  }

  function cancel(bytes32 proposal) internal {
    delete _scheduled()[proposal];
    emit ScheduleCancelled(proposal);
  }

  /// @dev Used for testing
  function getSchedule(bytes32 proposal) internal view returns (Schedule storage) {
    return _scheduled()[proposal];
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
