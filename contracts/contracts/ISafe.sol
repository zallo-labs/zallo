// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccountAbstraction.sol';
import '@openzeppelin/contracts/interfaces/IERC1271.sol';

/* Constants */
// Fixed-point percentage with a precision of 28; e.g. 5.2% = 0.52 * (100 ** 27)
// int256 can safely hold ~7e47 uint96s
int256 constant THRESHOLD = 10**28;

bytes4 constant EIP1271_SUCCESS = bytes4(
  keccak256('isValidSignature(bytes32,bytes)')
);

/* Types */
/// @notice Approver belonging to a group
/// @param addr Address of the approver
/// @param weight Fixed-point weight of precision 28; see THRESHOLD for more information
struct Approver {
  address addr;
  uint96 weight;
}

interface ISafe is IERC1271, IAccountAbstraction {
  /* Events */
  event TxExecuted(bytes32 txHash, bytes response);
  event TxReverted(bytes32 txHash, bytes response);
  event GroupUpserted(bytes32 groupRef, Approver[] approvers);
  event GroupRemoved(bytes32 groupRef);
  event Received(address from, uint256 value);

  /* Errors */
  error ExecutionReverted();
  error ApproverSignaturesMismatch();
  error TxAlreadyExecuted();
  error InvalidSignature(address signer);
  error BelowThreshold();
  error InvalidProof();
  error ApproverHashesNotAscending();
  error OnlyCallableByBootloader();
  error OnlyCallableBySafe();

  /// @notice ERC-1271: checks whether the hash was signed with the given signature
  /// @param txHash Hash of the tx
  /// @param txSignature Signature of the tx
  /// @return magicValue EIP1271_SUCCESS if the signature is valid, reverts otherwise
  function isValidSignature(bytes32 txHash, bytes memory txSignature)
    external
    view
    returns (bytes4 magicValue);

  /// @notice AA: validation of whether the transaction originated from the safe
  /// @dev We can safely avoid not limiting this to being called just by the bootloader
  /// @param transaction Transaction to be validated
  function validateTransaction(Transaction calldata transaction)
    external
    payable;

  /// @notice AA: execution of the transaction
  /// @dev Only callable by the bootloader
  /// @dev Transaction *must* be validated prior to execution
  /// @param transaction Transaction to be executed
  function executeTransaction(Transaction calldata transaction)
    external
    payable;

  /// @notice AA: execution of a transaction from an address other than the bootloader
  /// @param transaction Transaction to be validated and executed
  function executeTransactionFromOutside(Transaction calldata transaction)
    external
    payable;

  /// @notice Upsert (create or update) a group
  /// @dev Only callable by the safe
  /// @param groupRef Reference of the group to be upserted
  /// @param approvers Approvers to make up the group
  function upsertGroup(bytes32 groupRef, Approver[] calldata approvers)
    external;

  /// @notice Remove a group
  /// @dev Only callable by the safe
  /// @param groupRef Reference of the group to be removed
  function removeGroup(bytes32 groupRef) external;

  /// @param txHash Hash of the transaction
  /// @return True if the transaction has been executed
  function hasBeenExecuted(bytes32 txHash) external view returns (bool);
}
