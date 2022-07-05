// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {
  SignatureChecker
} from '@matterlabs/signature-checker/contracts/SignatureChecker.sol';
import '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';

import './ISafe.sol';
import './EIP712.sol';
import {MerkleProof} from './MerkleProof.sol';
import {BoolArray} from './BoolArray.sol';

contract Safe is ISafe, EIP712 {
  using SignatureChecker for address;
  using MerkleProof for bytes32[];

  /* Storage */
  /// @notice Bit map of executed txs
  mapping(uint256 => uint256) executedTxs;

  /// @notice Merkle root of the state of each group
  /// @dev groupRef => merkleRoot
  /// @dev Leaves: [approver 1, ..., approver n]
  mapping(bytes32 => bytes32) groupMerkleRoots;

  /* External/public functions */
  constructor(bytes32 _groupRef, Approver[] memory _approvers) {
    _upsertGroup(_groupRef, _approvers);
  }

  receive() external payable emitWhenPaid {}

  /// @inheritdoc ISafe
  function isValidSignature(bytes32 _txHash, bytes memory _txSignature)
    external
    view
    returns (bytes4)
  {
    _validateSignature(_txHash, _txSignature);
    return EIP1271_SUCCESS;
  }

  /// @inheritdoc ISafe
  function validateTransaction(Transaction calldata _tx)
    external
    payable
    emitWhenPaid
  {
    _validateTransaction(_hashTx(_tx), _tx);
  }

  /// @inheritdoc ISafe
  function executeTransaction(Transaction calldata _tx)
    external
    payable
    onlyBootloader
    emitWhenPaid
  {
    _executeTransaction(_hashTx(_tx), _tx);
  }

  /// @inheritdoc ISafe
  function executeTransactionFromOutside(Transaction calldata _tx)
    external
    payable
    emitWhenPaid
  {
    bytes32 txHash = _hashTx(_tx);
    _validateTransaction(txHash, _tx);
    _executeTransaction(txHash, _tx);
  }

  /// @inheritdoc ISafe
  function upsertGroup(bytes32 _groupRef, Approver[] calldata _approvers)
    external
    onlySafe
  {
    _upsertGroup(_groupRef, _approvers);
  }

  /// @inheritdoc ISafe
  function removeGroup(bytes32 _groupRef) external onlySafe {
    delete groupMerkleRoots[_groupRef];
    emit GroupRemoved(_groupRef);
  }

  /// @inheritdoc ISafe
  function hasBeenExecuted(bytes32 _txHash) public view returns (bool) {
    uint256 index = uint256(_txHash);
    uint256 wordIndex = index / 256;
    uint256 bitIndex = index % 256;
    uint256 mask = (1 << bitIndex);
    return executedTxs[wordIndex] & mask == mask;
  }

  function _setExecuted(bytes32 _txHash) internal {
    uint256 index = uint256(_txHash);
    uint256 wordIndex = index / 256;
    uint256 bitIndex = index % 256;
    executedTxs[wordIndex] = executedTxs[wordIndex] | (1 << bitIndex);
  }

  function _validateTransaction(bytes32 _txHash, Transaction calldata _tx)
    internal
    view
  {
    if (hasBeenExecuted(_txHash)) revert TxAlreadyExecuted();

    _validateSignature(_txHash, _tx.signature);
  }

  /// @dev Only to be called post validation!
  function _executeTransaction(bytes32 _txHash, Transaction calldata _tx)
    internal
  {
    _setExecuted(_txHash);

    address to = address(uint160(_tx.to));
    (bool success, bytes memory response) = to.call{value: _tx.reserved[1]}(
      _tx.data
    );

    if (!success) {
      emit TxReverted(_txHash, response);

      if (response.length > 0) {
        assembly {
          let returndata_size := mload(response)
          revert(add(32, response), returndata_size)
        }
      } else {
        revert ExecutionReverted();
      }
    }

    emit TxExecuted(_txHash, response);
  }

  function _validateSignature(bytes32 _txHash, bytes memory _txSignature)
    internal
    view
  {
    TxSignature memory sig = abi.decode(_txSignature, (TxSignature));

    _validateSigners(_txHash, sig.approvers, sig.signatures);
    _satisfiesThreshold(sig.approvers);
    _verifyMultiProof(
      groupMerkleRoots[sig.groupRef],
      sig.proof,
      sig.proofFlags,
      sig.approvers
    );
  }

  function _validateSigners(
    bytes32 _txHash,
    Approver[] memory _approvers,
    bytes[] memory _signatures
  ) internal pure {
    if (_approvers.length != _signatures.length)
      revert ApproverSignaturesMismatch();

    for (uint256 i = 0; i < _approvers.length; ) {
      if (!_approvers[i].addr.checkSignature(_txHash, _signatures[i]))
        revert InvalidSignature(_approvers[i].addr);

      unchecked {
        ++i;
      }
    }
  }

  function _satisfiesThreshold(Approver[] memory _approvers) internal pure {
    int256 required = THRESHOLD;
    for (uint256 i = 0; i < _approvers.length; ) {
      // Can't cause a negative overflow as required (int256) can safely hold ~7e47 weights (uint96)
      unchecked {
        required -= int256(uint256(_approvers[i].weight));
        ++i;
      }
    }

    if (required > 0) revert BelowThreshold();
  }

  function _verifyMultiProof(
    bytes32 _root,
    bytes32[] memory _proof,
    uint256[] memory _proofFlags,
    Approver[] memory _approvers
  ) internal pure {
    bytes32[] memory leaves = _getLeaves(_approvers);
    if (_proof.processMultiProof(_proofFlags, leaves) != _root)
      revert InvalidProof();
  }

  function _getLeaves(Approver[] memory _approvers)
    internal
    pure
    returns (bytes32[] memory leaves)
  {
    leaves = new bytes32[](_approvers.length);
    for (uint256 i = 0; i < _approvers.length; ) {
      leaves[i] = keccak256(abi.encode(_approvers[i]));

      // Hashes need to be sorted
      if (i > 0 && leaves[i] < leaves[i - 1])
        revert ApproverHashesNotAscending();

      unchecked {
        ++i;
      }
    }
  }

  function _upsertGroup(bytes32 _groupRef, Approver[] memory _approvers)
    internal
  {
    _satisfiesThreshold(_approvers);

    bytes32[] memory leaves = _getLeaves(_approvers);
    groupMerkleRoots[_groupRef] = leaves.merkleRoot();

    emit GroupUpserted(_groupRef, _approvers);
  }

  modifier onlyBootloader() {
    if (msg.sender != BOOTLOADER_FORMAL_ADDRESS)
      revert OnlyCallableByBootloader();
    _;
  }

  modifier onlySafe() {
    if (msg.sender != address(this)) revert OnlyCallableBySafe();
    _;
  }

  modifier emitWhenPaid() {
    if (msg.value > 0) emit Received(msg.sender, msg.value);
    _;
  }
}
