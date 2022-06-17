// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {
  SignatureChecker
} from '@matterlabs/signature-checker/contracts/SignatureChecker.sol';

import './Types.sol';
import './EIP712.sol';

/* Errors */
error NotSafe();

error GroupAlreadyExists();
error ApproverExceedsThreshold();
error BelowThreshold();

error ApproversHashMismatch();
error SignaturesNotAscending();
error ApproversNotAscending();
error InvalidSignature(address signer);

error TxAlreadyExecuted();
error ApproverNotInGroup(address approver);
error ExecutionReverted(bytes response);

contract Safe is EIP712 {
  using SignatureChecker for address;

  mapping(bytes32 => Group) groups;
  mapping(bytes32 => bool) txHashSeen;

  /* Events */
  event Deposit(address from, uint256 value);
  event Transaction(bytes32 txHash, bytes response);
  event MultiTransaction(bytes32 txHash, bytes[] responses);
  event GroupAdded(bytes32 groupId, Approver[] approvers);
  event GroupRemoved(bytes32 groupId);
  event GroupUpdated(bytes32 groupId, Approver[] approvers);

  constructor(bytes32 _groupId, Approver[] memory _approvers) {
    _addGroup(_groupId, _approvers);
  }

  receive() external payable {
    emit Deposit(msg.sender, msg.value);
  }

  fallback() external payable {
    emit Deposit(msg.sender, msg.value);
  }

  function execute(
    Op calldata _op,
    bytes32 _groupId,
    Signer[] calldata _signers
  )
    external
    signersUniqueAndSortedAsc(_signers)
    returns (bytes memory response)
  {
    bytes32 txHash = _hashTx(_op);
    _verify(txHash, _groupId, _signers);

    response = _call(_op);

    emit Transaction(txHash, response);
  }

  function multiExecute(
    Op[] calldata _ops,
    bytes32 _groupId,
    Signer[] calldata _signers
  )
    external
    signersUniqueAndSortedAsc(_signers)
    returns (bytes[] memory responses)
  {
    bytes32 txHash = _hashTx(_ops);
    _verify(txHash, _groupId, _signers);

    responses = new bytes[](_ops.length);
    for (uint256 i = 0; i < _ops.length; i++) {
      responses[i] = _call(_ops[i]);
    }

    emit MultiTransaction(txHash, responses);
  }

  function addGroup(bytes32 _id, Approver[] calldata _approvers)
    external
    onlySafe
  {
    _addGroup(_id, _approvers);
    emit GroupAdded(_id, _approvers);
  }

  function removeGroup(bytes32 _id, Approver[] calldata _approvers)
    external
    onlySafe
  {
    _clearApprovers(groups[_id], _approvers);
    delete groups[_id];

    emit GroupRemoved(_id);
  }

  function updateGroup(
    bytes32 _id,
    Approver[] calldata _approvers,
    Approver[] calldata _newApprovers
  ) external onlySafe {
    Group storage group = groups[_id];

    _clearApprovers(group, _approvers);
    _setApprovers(group, _newApprovers);

    emit GroupUpdated(_id, _newApprovers);
  }

  function _verify(
    bytes32 _txHash,
    bytes32 _groupId,
    Signer[] calldata _signers
  ) internal {
    if (_signers.length == 0 && _isPrimaryApprover(_groupId)) {
      // Note. txHash not marked as seen if no signature is provided as it can't be replayed
      return;
    }

    if (txHashSeen[_txHash]) revert TxAlreadyExecuted();
    txHashSeen[_txHash] = true;

    Group storage group = groups[_groupId];
    address[] memory approvers = new address[](_signers.length);

    int256 req = THRESHOLD;
    for (uint256 i = 0; req > 0 && i < _signers.length; i++) {
      Signer calldata signer = _signers[i];

      // Verify Signature
      if (!signer.addr.checkSignature(_txHash, signer.signature))
        revert InvalidSignature(signer.addr);

      // Reduce required weight by the weight of the signer; the value is too small to overflow req
      int256 weight = group.approvers[signer.addr];
      if (weight == 0) revert ApproverNotInGroup(signer.addr);
      approvers[i] = signer.addr;

      // Negative overflow not possible
      unchecked {
        req -= weight;
      }
    }

    if (req > 0) revert BelowThreshold();
  }

  function _call(Op calldata _op) internal returns (bytes memory) {
    (bool success, bytes memory response) = _op.to.call{value: _op.value}(
      _op.data
    );

    if (!success) revert ExecutionReverted(response);

    return response;
  }

  function _addGroup(bytes32 _id, Approver[] memory _approvers) internal {
    Group storage group = groups[_id];
    if (group.approversHash != 0) revert GroupAlreadyExists();

    _setApprovers(group, _approvers);

    emit GroupAdded(_id, _approvers);
  }

  function _setApprovers(Group storage _group, Approver[] memory _approvers)
    internal
    approversUniqueAndSortedAsc(_approvers)
  {
    _group.approversHash = _hashApprovers(_approvers);

    // The group has to be able to sum to the threshold
    int256 req = THRESHOLD;
    for (uint256 i = 0; i < _approvers.length; i++) {
      Approver memory approver = _approvers[i];
      int256 weight = int256(uint256(approver.weight));

      if (weight > THRESHOLD) revert ApproverExceedsThreshold();

      _group.approvers[approver.addr] = weight;

      // Negative overflow not possible
      unchecked {
        req -= weight;
      }
    }

    if (req > 0) revert BelowThreshold();
  }

  function _clearApprovers(Group storage _group, Approver[] calldata _approvers)
    internal
    verifyApprovers(_group.approversHash, _approvers)
  {
    // Remove each approver from _group approvers
    mapping(address => int256) storage stored = _group.approvers;
    for (uint256 i = 0; i < _approvers.length; i++) {
      delete stored[_approvers[i].addr];
    }
  }

  function _hashApprovers(Approver[] memory _approvers)
    internal
    pure
    returns (bytes32)
  {
    return keccak256(abi.encode(_approvers));
  }

  function _isPrimaryApprover(bytes32 _groupId) internal view returns (bool) {
    return groups[_groupId].approvers[msg.sender] == THRESHOLD;
  }

  modifier onlySafe() {
    if (msg.sender != address(this)) revert NotSafe();
    _;
  }

  modifier verifyApprovers(
    bytes32 _approversHash,
    Approver[] calldata _approvers
  ) {
    if (_approversHash != _hashApprovers(_approvers))
      revert ApproversHashMismatch();
    _;
  }

  modifier signersUniqueAndSortedAsc(Signer[] calldata _signers) {
    for (uint256 i = 1; i < _signers.length; i++) {
      if (_signers[i - 1].addr >= _signers[i].addr)
        revert SignaturesNotAscending();
    }
    _;
  }

  modifier approversUniqueAndSortedAsc(Approver[] memory _approvers) {
    for (uint256 i = 1; i < _approvers.length; i++) {
      if (_approvers[i - 1].addr >= _approvers[i].addr)
        revert ApproversNotAscending();
    }
    _;
  }
}
