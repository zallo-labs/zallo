// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import { SignatureChecker } from '@matterlabs/signature-checker/contracts/SignatureChecker.sol';

import './ISafe.sol';
import './EIP712.sol';
import { MerkleProof } from './MerkleProof.sol';
import { BoolArray } from "./BoolArray.sol";

contract Safe is ISafe, EIP712 {
  using SignatureChecker for address;
  using MerkleProof for bytes32[];

  /// @dev txHash => hasBeenExecuted
  mapping(bytes32 => bool) txExecuted;

  /// @notice Merkle root of the state of each group
  /// @dev groupRef => merkleRoot
  mapping(bytes32 => bytes32) merkleRoots;

  constructor(bytes32 _groupRef, Approver[] memory _approvers) {
    _upsertGroup(_groupRef, _approvers);
  }

  receive() external payable {
    emit Received(msg.sender, msg.value);
  }

  /// @inheritdoc ISafe
  function execute(
    Op calldata _op,
    bytes32 _groupRef,
    Approver[] calldata _approvers,
    bytes[] calldata _signatures,
    bytes32[] calldata _proof,
    uint256[] calldata _proofFlags
  ) external returns (bytes memory response) {
    bytes32 txHash = _hashTx(_op);
    _verifyTx(txHash, _groupRef, _approvers, _signatures, _proof, _proofFlags);

    response = _call(txHash, _op);
    emit Transaction(txHash, response);
  }

  /// @inheritdoc ISafe
  function multiExecute(
    Op[] calldata _ops,
    bytes32 _groupRef,
    Approver[] calldata _approvers,
    bytes[] calldata _signatures,
    bytes32[] calldata _proof,
    uint256[] calldata _proofFlags
  ) external returns (bytes[] memory responses) {
    bytes32 txHash = _hashTx(_ops);
    _verifyTx(txHash, _groupRef, _approvers, _signatures, _proof, _proofFlags);

    responses = new bytes[](_ops.length);
    for (uint256 i = 0; i < _ops.length; i++) {
      responses[i] = _call(txHash, _ops[i]);
    }

    emit MultiTransaction(txHash, responses);
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
    delete merkleRoots[_groupRef];
    emit GroupRemoved(_groupRef);
  }

  function _call(bytes32 _txHash, Op calldata _op) internal returns (bytes memory) {
    (bool success, bytes memory response) = _op.to.call{value: _op.value}(
      _op.data
    );

    if (!success) {
      emit TransactionReverted(_txHash, response);

      if (response.length > 0) {
        assembly {
          let returndata_size := mload(response)
          revert(add(32, response), returndata_size)
        }
      } else {
        revert ExecutionReverted();
      }
    }

    return response;
  }

  function _verifyTx(
    bytes32 _txHash,
    bytes32 _groupRef,
    Approver[] calldata _approvers,
    bytes[] calldata _signatures,
    bytes32[] calldata _proof,
    uint256[] calldata _proofFlags
  ) internal {
    _preventReentrancy(_txHash);
    _validateApproverSignatures(_txHash, _approvers, _signatures);
    _satisfiesThreshold(_approvers);
    _verifyMultiProof(_proof, _proofFlags, merkleRoots[_groupRef], _approvers);
  }

  function _preventReentrancy(bytes32 _txHash) internal {
    if (txExecuted[_txHash]) revert TxAlreadyExecuted();
    txExecuted[_txHash] = true;
  }

  function _validateApproverSignatures(
    bytes32 _txHash,
    Approver[] calldata _approvers,
    bytes[] calldata _signatures
  ) internal pure {
    if (_approvers.length != _signatures.length)
      revert ApproversSignaturesLenMismatch();

    for (uint256 i = 0; i < _approvers.length; i++) {
      address approver = _approvers[i].addr;

      if (!approver.checkSignature(_txHash, _signatures[i]))
        revert InvalidSignature(approver);
    }
  }

  function _satisfiesThreshold(Approver[] memory _approvers) internal pure {
    int256 req = THRESHOLD;
    for (uint256 i = 0; i < _approvers.length; i++) {
      // Can't negative overflow - int256 can safely hold ~7e47 uint96s
      unchecked {
        req -= int256(uint256(_approvers[i].weight));
      }
    }

    if (req > 0) revert BelowThreshold();
  }

  function _verifyMultiProof(
    bytes32[] calldata _proof,
    uint256[] calldata _proofFlags,
    bytes32 _root,
    Approver[] calldata _approvers
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
    for (uint256 i = 0; i < _approvers.length; i++) {
      leaves[i] = keccak256(abi.encode(_approvers[i]));

      // Hashes need to be sorted
      if (i > 0 && leaves[i] < leaves[i - 1])
        revert ApproverHashesNotAscending();
    }
  }

  function _upsertGroup(bytes32 _groupRef, Approver[] memory _approvers)
    internal
  {
    _satisfiesThreshold(_approvers);

    bytes32[] memory leaves = _getLeaves(_approvers);
    merkleRoots[_groupRef] = leaves.merkleRoot();

    emit GroupUpserted(_groupRef, _approvers);
  }

  modifier onlySafe() {
    if (msg.sender != address(this)) revert OnlyCallableBySafe();
    _;
  }
}
