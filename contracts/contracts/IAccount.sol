// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import { Transaction } from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol';
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

// BaseIAccount is currently incorrect, as it doesn't mark
interface IAccount is IERC1271 {
  /*//////////////////////////////////////////////////////////////
                                 EVENTS
  //////////////////////////////////////////////////////////////*/

  // TODO: change quorums back to address[][] once graph-cli can handle it - https://github.com/graphprotocol/graph-cli/issues/342
  event WalletUpserted(Ref walletRef, bytes[] quorums);
  event WalletRemoved(Ref walletRef);

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

  /// @notice AA: validation of whether the transaction originated from the account
  /// @dev We can accountly avoid not limiting this to being called just by the bootloader
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

  /// @notice Upsert (create or update) an wallet
  /// @dev Only callable by the account
  /// @param walletRef Reference of the wallet to be upserted
  /// @param quorums Quorums to make up the wallet
  function upsertWallet(Ref walletRef, address[][] calldata quorums) external;

  /// @notice Remove an wallet
  /// @dev Only callable by the account
  /// @param walletRef Reference of the wallet to be removed
  function removeWallet(Ref walletRef) external;
}
