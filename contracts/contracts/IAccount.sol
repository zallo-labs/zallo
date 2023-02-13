// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction, IAccount as BaseIAccount} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol';
import '@openzeppelin/contracts/interfaces/IERC1271.sol';

import './Quorum.sol';

/*//////////////////////////////////////////////////////////////
                                CONSTANTS
  //////////////////////////////////////////////////////////////*/

bytes4 constant EIP1271_SUCCESS = bytes4(keccak256('isValidSignature(bytes32,bytes)'));

interface IAccount is BaseIAccount, IERC1271 {
  /*//////////////////////////////////////////////////////////////
                                 EVENTS
  //////////////////////////////////////////////////////////////*/

  event QuorumUpserted(QuorumKey indexed key, bytes32 quorumHash);
  event QuorumRemoved(QuorumKey indexed key);

  /*//////////////////////////////////////////////////////////////
                                 ERRORS
  //////////////////////////////////////////////////////////////*/

  error QuorumHashMismatch(bytes32 expected);
  error ApproverSignaturesMismatch();
  error TransactionAlreadyExecuted();
  error InvalidSignature(address approver);
  error InvalidProof();
  error InsufficientBalance();
  error FailedToPayBootloader();
  error OnlyCallableByBootloader();

  /// @notice Upsert (create or update) a quorum
  /// @dev Only callable by the account
  /// @param quorumHash Hash of quorum to be upserted
  function upsertQuorum(QuorumKey key, bytes32 quorumHash) external payable;

  /// @notice Remove a quorum
  /// @dev Only callable by the account
  /// @param key Quorum to be removed
  function removeQuorum(QuorumKey key) external payable;
}
