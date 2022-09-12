// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {
  Transaction,
  IAccount as BaseIAccount
} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol';
import '@openzeppelin/contracts/interfaces/IERC1271.sol';

import './UserHelper.sol';

/*//////////////////////////////////////////////////////////////
                                CONSTANTS
  //////////////////////////////////////////////////////////////*/

bytes4 constant EIP1271_SUCCESS = bytes4(
  keccak256('isValidSignature(bytes32,bytes)')
);

interface IAccount is BaseIAccount, IERC1271 {
  /*//////////////////////////////////////////////////////////////
                                 EVENTS
  //////////////////////////////////////////////////////////////*/

  event UserUpserted(User user);
  event UserRemoved(address user);

  /*//////////////////////////////////////////////////////////////
                                 ERRORS
  //////////////////////////////////////////////////////////////*/

  error ApproverSignaturesMismatch();
  error TxAlreadyExecuted();
  error InvalidSignature(address approver);
  error InvalidProof();
  error OnlyCallableByBootloader();

  /// @notice Upsert (create or update) a user
  /// @dev Only callable by the account
  /// @param user User to be upserted
  function upsertUser(User calldata user) external;

  /// @notice Remove a user
  /// @dev Only callable by the account
  /// @param user User to be removed
  function removeUser(address user) external;
}
