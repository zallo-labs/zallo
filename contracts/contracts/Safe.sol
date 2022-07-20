// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {
  SignatureChecker
} from '@matterlabs/signature-checker/contracts/SignatureChecker.sol';
import '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';

import './ISafe.sol';
import './SelfOwned.sol';
import './Initializable.sol';
import './Upgradeable.sol';
import './ERC165.sol';
import './ERC721Receiver.sol';
import {MerkleProof} from './utils/MerkleProof.sol';
import {BoolArray} from './utils/BoolArray.sol';

contract Safe is
  ISafe,
  SelfOwned,
  Initializable,
  Upgradeable,
  ERC165,
  ERC721Receiver
{
  using SignatureChecker for address;
  using MerkleProof for bytes32[];

  /*//////////////////////////////////////////////////////////////
                             INITIALIZATION
  //////////////////////////////////////////////////////////////*/

  constructor() {
    // Prevent the contract from being initialized, thereby only allowing use through a proxy
    _preventInitialization();
  }

  function initialize(bytes32 groupRef, Approver[] memory approvers)
    external
    initializer
  {
    _upsertGroup(groupRef, approvers);
  }

  /*//////////////////////////////////////////////////////////////
                                FALLBACK
  //////////////////////////////////////////////////////////////*/

  receive() external payable {}

  fallback() external payable {}

  /*//////////////////////////////////////////////////////////////
                          TRANSACTION HANDLING
  //////////////////////////////////////////////////////////////*/

  /// @inheritdoc ISafe
  function validateTransaction(Transaction calldata transaction)
    external
    payable
    override
  {
    _validateTransaction(_hashTx(transaction), transaction);
  }

  /// @inheritdoc ISafe
  function executeTransaction(Transaction calldata transaction)
    external
    payable
    override
    onlyBootloader
  {
    _executeTransaction(_hashTx(transaction), transaction);
  }

  /// @inheritdoc ISafe
  function executeTransactionFromOutside(Transaction calldata transaction)
    external
    payable
    override
  {
    bytes32 txHash = _hashTx(transaction);
    _validateTransaction(txHash, transaction);
    _executeTransaction(txHash, transaction);
  }

  function _validateTransaction(
    bytes32 txHash,
    Transaction calldata transaction
  ) internal {
    NONCE_HOLDER_SYSTEM_CONTRACT.incrementNonceIfEquals(
      transaction.reserved[0] // nonce
    );

    if (hasBeenExecuted(txHash)) revert TxAlreadyExecuted();

    _validateSignature(txHash, transaction.signature);
  }

  /*//////////////////////////////////////////////////////////////
                            GROUP MANAGEMENT
  //////////////////////////////////////////////////////////////*/

  /// @inheritdoc ISafe
  function upsertGroup(bytes32 groupRef, Approver[] calldata approvers)
    external
    onlySelf
  {
    _upsertGroup(groupRef, approvers);
  }

  /// @inheritdoc ISafe
  function removeGroup(bytes32 groupRef) external onlySelf {
    delete _groupMerkleRoots()[groupRef];
    emit GroupRemoved(groupRef);
  }

  function _upsertGroup(bytes32 groupRef, Approver[] memory approvers)
    internal
  {
    _satisfiesThreshold(approvers);

    bytes32[] memory leaves = _getMerkleLeaves(approvers);
    _groupMerkleRoots()[groupRef] = leaves.merkleRoot();

    emit GroupUpserted(groupRef, approvers);
  }

  /*//////////////////////////////////////////////////////////////
                          SIGNATURE VALIDATION
  //////////////////////////////////////////////////////////////*/

  /// @inheritdoc ISafe
  function isValidSignature(bytes32 txHash, bytes memory txSignature)
    external
    view
    override
    returns (bytes4)
  {
    _validateSignature(txHash, txSignature);
    return EIP1271_SUCCESS;
  }

  function _validateSignature(bytes32 txHash, bytes memory txSignature)
    internal
    view
  {
    (
      bytes32 groupRef,
      Approver[] memory approvers,
      bytes[] memory signatures,
      bytes32[] memory proof,
      uint256[] memory proofFlags
    ) = abi.decode(
        txSignature,
        (bytes32, Approver[], bytes[], bytes32[], uint256[])
      );

    _validateSigners(txHash, approvers, signatures);
    _satisfiesThreshold(approvers);
    _verifyMultiProof(
      _groupMerkleRoots()[groupRef],
      proof,
      proofFlags,
      approvers
    );
  }

  function _validateSigners(
    bytes32 txHash,
    Approver[] memory approvers,
    bytes[] memory signatures
  ) internal pure {
    if (approvers.length != signatures.length)
      revert ApproverSignaturesMismatch();

    for (uint256 i = 0; i < approvers.length; ) {
      if (!approvers[i].addr.checkSignature(txHash, signatures[i]))
        revert InvalidSignature(approvers[i].addr);

      unchecked {
        ++i;
      }
    }
  }

  function _satisfiesThreshold(Approver[] memory approvers) internal pure {
    int256 required = THRESHOLD;
    for (uint256 i = 0; i < approvers.length; ) {
      // Can't cause a negative overflow as required (int256) can safely hold ~7e47 weights (uint96)
      unchecked {
        required -= int256(uint256(approvers[i].weight));
        ++i;
      }
    }

    if (required > 0) revert BelowThreshold();
  }

  /*//////////////////////////////////////////////////////////////
                           GROUP MERKLE ROOTS
  //////////////////////////////////////////////////////////////*/

  // TODO: set mapping directly once "Invalid stack item name: slot" is fixed - https://github.com/ethereum/solidity/issues/13259
  struct GroupMerkleRootsStruct {
    mapping(bytes32 => bytes32) groupMerkleRoots;
  }

  /// @notice Merkle root of the state of each group
  /// @dev groupRef => merkleRoot
  /// @dev Leaves: [approver 1, ..., approver n]
  function _groupMerkleRoots()
    internal
    view
    returns (mapping(bytes32 => bytes32) storage)
  {
    GroupMerkleRootsStruct storage s;
    assembly {
      // keccack256('Safe.groupMerkleRoots')
      s.slot := 0xed40d626ce12519ab37591279a85e0a52bfad0c2776563d70506f626f959d1d9
    }

    return s.groupMerkleRoots;
  }

  function _verifyMultiProof(
    bytes32 root,
    bytes32[] memory proof,
    uint256[] memory proofFlags,
    Approver[] memory approvers
  ) internal pure {
    bytes32[] memory leaves = _getMerkleLeaves(approvers);
    if (proof.processMultiProof(proofFlags, leaves) != root)
      revert InvalidProof();
  }

  function _getMerkleLeaves(Approver[] memory approvers)
    internal
    pure
    returns (bytes32[] memory leaves)
  {
    leaves = new bytes32[](approvers.length);
    for (uint256 i = 0; i < approvers.length; ) {
      leaves[i] = keccak256(abi.encode(approvers[i]));

      // Hashes need to be sorted
      if (i > 0 && leaves[i] < leaves[i - 1])
        revert ApproverHashesNotAscending();

      unchecked {
        ++i;
      }
    }
  }

  /*//////////////////////////////////////////////////////////////
                                MODIFIERS
  //////////////////////////////////////////////////////////////*/

  modifier onlyBootloader() {
    if (msg.sender != BOOTLOADER_FORMAL_ADDRESS)
      revert OnlyCallableByBootloader();
    _;
  }
}
