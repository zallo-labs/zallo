// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {
  Transaction,
  IAccount as BaseIAccount
} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol';
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
interface IAccount is IERC1271, BaseIAccount {
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
