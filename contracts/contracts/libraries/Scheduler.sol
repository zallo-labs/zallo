// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.20;

library Scheduler {
  event Scheduled(bytes32 proposal, uint256 timestamp);
  event ScheduleCancelled(bytes32 proposal);

  error NotScheduled(bytes32 proposal);
  error NotScheduledYet(bytes32 proposal, uint256 timestamp);

  function schedule(bytes32 proposal, uint256 timestamp) internal {
    _scheduled()[proposal] = timestamp;
    emit Scheduled(proposal, timestamp);
  }

  function consume(bytes32 proposal) internal {
    uint256 timestamp = _scheduled()[proposal];
    if (timestamp == 0) revert NotScheduled(proposal);
    if (block.timestamp < timestamp) revert NotScheduledYet(proposal, timestamp);

    delete _scheduled()[proposal];
  }

  function cancel(bytes32 proposal) internal {
    delete _scheduled()[proposal];
    emit ScheduleCancelled(proposal);
  }

  function getSchedule(bytes32 proposal) internal view returns (uint256) {
    return _scheduled()[proposal];
  }

  /*//////////////////////////////////////////////////////////////
                                STORAGE
  //////////////////////////////////////////////////////////////*/

  function _scheduled() private pure returns (mapping(bytes32 => uint256) storage s) {
    assembly {
      // keccack256('Scheduler.scheduled')
      s.slot := 0x7a81838ee1d2d55d040ef92fa46a2bc4f9afa4c0e8adae71b5b797e5dab5146f
    }
  }
}
