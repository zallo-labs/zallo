// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccountAbstraction.sol';
import '@openzeppelin/contracts/interfaces/IERC1271.sol';

/*//////////////////////////////////////////////////////////////
                                CONSTANTS
  //////////////////////////////////////////////////////////////*/

bytes4 constant EIP1271_SUCCESS = bytes4(
  keccak256('isValidSignature(bytes32,bytes)')
);

/*//////////////////////////////////////////////////////////////
                                  TYPES
//////////////////////////////////////////////////////////////*/

type Ref is bytes4;

interface ISafe is IERC1271, IAccountAbstraction {
  /*//////////////////////////////////////////////////////////////
                                 EVENTS
  //////////////////////////////////////////////////////////////*/

  // TODO: change quorums back to address[][] once graph-cli can handle it - https://github.com/graphprotocol/graph-cli/issues/342
  event AccountUpserted(Ref accountRef, bytes[] quorums);
  event AccountRemoved(Ref accountRef);

  /*//////////////////////////////////////////////////////////////
                                 ERRORS
  //////////////////////////////////////////////////////////////*/

  error ApproverSignaturesMismatch();
  error TxAlreadyExecuted();
  error InvalidSignature(address approver);
  error InvalidProof();
  error QuorumNotAscending();
  error EmptyQuorum();
  error EmptyQuorums();
  error QuorumHashesNotUniqueAndAscending();
  error OnlyCallableByBootloader();

  /// @notice ERC-1271: checks whether the hash was signed with the given signature
  /// @param txHash Hash of the tx
  /// @param txSignature Signature of the tx
  /// @return magicValue EIP1271_SUCCESS if the signature is valid, reverts otherwise
  function isValidSignature(bytes32 txHash, bytes memory txSignature)
    external
    view
    override
    returns (bytes4 magicValue);

  /// @notice AA: validation of whether the transaction originated from the safe
  /// @dev We can safely avoid not limiting this to being called just by the bootloader
  /// @param transaction Transaction to be validated
  function validateTransaction(Transaction calldata transaction)
    external
    payable
    override;

  /// @notice AA: execution of the transaction
  /// @dev Only callable by the bootloader
  /// @dev Transaction *must* be validated prior to execution
  /// @param transaction Transaction to be executed
  function executeTransaction(Transaction calldata transaction)
    external
    payable
    override;

  /// @notice AA: execution of a transaction from an address other than the bootloader
  /// @param transaction Transaction to be validated and executed
  function executeTransactionFromOutside(Transaction calldata transaction)
    external
    payable
    override;

  /// @notice Upsert (create or update) an account
  /// @dev Only callable by the safe
  /// @param accountRef Reference of the account to be upserted
  /// @param quorums Quorums to make up the account
  function upsertAccount(Ref accountRef, address[][] calldata quorums) external;

  /// @notice Remove an account
  /// @dev Only callable by the safe
  /// @param accountRef Reference of the account to be removed
  function removeAccount(Ref accountRef) external;
}
