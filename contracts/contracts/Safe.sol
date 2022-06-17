// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {
  SignatureChecker
} from '@matterlabs/signature-checker/contracts/SignatureChecker.sol';

import './Types.sol';
import './EIP712.sol';

/* Errors */
error NotSafe();

error ApproverExceedsThreshold();
error BelowThreshold();

error SignaturesNotAscending();
error ApproversNotAscending();
error InvalidSignature(address signer, bytes signature);

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
  event GroupAdded(Approver[] approvers);
  event GroupRemoved(bytes32 groupHash);

  constructor(Approver[] memory _approvers) {
    _addGroup(_approvers);
  }

  receive() external payable {
    emit Deposit(msg.sender, msg.value);
  }

  fallback() external payable {
    emit Deposit(msg.sender, msg.value);
  }

  function execute(
    Op calldata _op,
    bytes32 _groupHash,
    Signer[] calldata _signers
  )
    external
    signersUniqueAndSortedAsc(_signers)
    returns (bytes memory response)
  {
    bytes32 txHash = _hashTx(_op);
    _verify(txHash, _groupHash, _signers);

    response = _call(_op);

    emit Transaction(txHash, response);
  }

  function multiExecute(
    Op[] calldata _ops,
    bytes32 _groupHash,
    Signer[] calldata _signers
  )
    external
    signersUniqueAndSortedAsc(_signers)
    returns (bytes[] memory responses)
  {
    bytes32 txHash = _hashTx(_ops);
    _verify(txHash, _groupHash, _signers);

    responses = new bytes[](_ops.length);
    for (uint256 i = 0; i < _ops.length; i++) {
      responses[i] = _call(_ops[i]);
    }

    emit MultiTransaction(txHash, responses);
  }

  function addGroup(Approver[] calldata _approvers)
    external
    onlySafe
    returns (bytes32)
  {
    return _addGroup(_approvers);
  }

  function removeGroup(bytes32 _groupHash) external onlySafe {
    delete groups[_groupHash];
    emit GroupRemoved(_groupHash);
  }

  function _verify(
    bytes32 _txHash,
    bytes32 _groupHash,
    Signer[] calldata _signers
  ) internal {
    if (_signers.length == 0 && _isPrimaryApprover(_groupHash)) {
      // Note. txHash not marked as seen if no signature is provided as it can't be replayed
      return;
    }

    if (txHashSeen[_txHash]) revert TxAlreadyExecuted();
    txHashSeen[_txHash] = true;

    Group storage group = groups[_groupHash];
    address[] memory approvers = new address[](_signers.length);

    int256 req = THRESHOLD;
    for (uint256 i = 0; req > 0 && i < _signers.length; i++) {
      Signer calldata signer = _signers[i];

      // Verify Signature
      if (!signer.addr.checkSignature(_txHash, signer.signature))
        revert InvalidSignature(signer.addr, signer.signature);

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

  function _addGroup(Approver[] memory _approvers)
    internal
    approversUniqueAndSortedAsc(_approvers)
    returns (bytes32)
  {
    bytes32 groupHash = _hashGroup(_approvers);
    Group storage group = groups[groupHash];

    // The group has to be able to sum to >= 100%
    int256 req = THRESHOLD;
    for (uint256 i = 0; i < _approvers.length; i++) {
      Approver memory approver = _approvers[i];
      int256 weight = int256(uint256(approver.weight));

      if (weight > THRESHOLD) revert ApproverExceedsThreshold();

      group.approvers[approver.addr] = weight;

      // Negative overflow not possible
      unchecked {
        req -= weight;
      }
    }

    if (req > 0) revert BelowThreshold();

    emit GroupAdded(_approvers);

    return groupHash;
  }

  function _hashGroup(Approver[] memory _approvers)
    internal
    pure
    returns (bytes32)
  {
    return keccak256(abi.encode(_approvers));
  }

  function _isPrimaryApprover(bytes32 _groupHash) internal view returns (bool) {
    return groups[_groupHash].approvers[msg.sender] == THRESHOLD;
  }

  modifier onlySafe() {
    if (msg.sender != address(this)) revert NotSafe();
    _;
  }

  modifier signersUniqueAndSortedAsc(Signer[] calldata _signers) {
    // Gas efficient way to assert that _signatures is a unique set
    for (uint256 i = 1; i < _signers.length; i++) {
      if (_signers[i - 1].addr >= _signers[i].addr)
        revert SignaturesNotAscending();
    }
    _;
  }

  modifier approversUniqueAndSortedAsc(Approver[] memory _approvers) {
    // Gas efficient way to assert that _approvers is a unique set
    for (uint256 i = 1; i < _approvers.length; i++) {
      if (_approvers[i - 1].addr >= _approvers[i].addr)
        revert ApproversNotAscending();
    }
    _;
  }
}
