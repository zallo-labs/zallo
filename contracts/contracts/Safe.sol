// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import {
  SignatureChecker
} from '@matterlabs/signature-checker/contracts/SignatureChecker.sol';

import './Types.sol';
import './EIP712/EIP712.sol';

contract Safe is EIP712 {
  using SignatureChecker for address;

  mapping(bytes32 => Group) groups;
  mapping(bytes32 => bool) txHashSeen;

  /* Events */
  event Deposit(address from, uint256 value);
  event Execution(
    Tx tx,
    bytes32 groupHash,
    address[] approvers,
    address executor,
    bytes response
  );
  event GroupAdded(Approver[] approvers);
  event GroupRemoved(bytes32 groupHash);

  /* Errors */
  error OnlyCallableBySafe();

  error ApproverWeightExceedsMax();
  error TotalWeightInsufficient();

  error SignaturesNotAscending();
  error ApproversNotAscending();
  error InvalidSignature(address signer, bytes signature);

  error TxAlreadyExecuted();
  error ApproverNotInGroup(address approver);
  error ExecutionReverted(bytes response);

  constructor(Approver[] memory _approvers) {
    _addGroup(_approvers);
  }

  receive() external payable {
    emit Deposit(msg.sender, msg.value);
  }

  fallback() external payable {
    emit Deposit(msg.sender, msg.value);
  }

  function execute(SignedTx calldata _st, bytes32 _groupHash)
    public
    signersUniqueAndSortedAsc(_st.signers)
    returns (bytes memory response)
  {
    address[] memory approvers = _verify(_st, _groupHash);

    response = _call(_st.tx);
    emit Execution(_st.tx, _groupHash, approvers, msg.sender, response);
  }

  function batchExecute(SignedTx[] calldata _st, bytes32 _groupHash)
    external
    returns (bytes[] memory responses)
  {
    responses = new bytes[](_st.length);
    for (uint256 i = 0; i < _st.length; i++) {
      responses[i] = execute(_st[i], _groupHash);
    }
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

  function hashGroup(Approver[] memory _approvers)
    public
    pure
    returns (bytes32)
  {
    return keccak256(abi.encode(_approvers));
  }

  function _verify(SignedTx calldata _st, bytes32 _groupHash)
    internal
    returns (address[] memory)
  {
    Signer[] calldata signers = _st.signers;
    if (signers.length == 0 && _isPrimaryApprover(_groupHash)) {
      // Note. txHash not marked as seen if no signature is provided as it can't be replayed
      return new address[](0);
    }

    bytes32 txHash = _hashTx(_st.tx);
    if (txHashSeen[txHash]) revert TxAlreadyExecuted();
    txHashSeen[txHash] = true;

    Group storage group = groups[_groupHash];
    address[] memory approvers = new address[](signers.length);

    int256 req = _100_PERCENT_WEIGHT;
    for (uint256 i = 0; req > 0 && i < signers.length; i++) {
      Signer calldata signer = signers[i];

      // Verify Signature
      if (!signer.addr.checkSignature(txHash, signer.signature))
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

    if (req > 0) revert TotalWeightInsufficient();

    return approvers;
  }

  function _call(Tx calldata _tx) internal returns (bytes memory) {
    (bool success, bytes memory response) = _tx.to.call{value: _tx.value}(
      _tx.data
    );

    if (!success) revert ExecutionReverted(response);

    return response;
  }

  function _addGroup(Approver[] memory _approvers)
    internal
    approversUniqueAndSortedAsc(_approvers)
    returns (bytes32)
  {
    bytes32 groupHash = hashGroup(_approvers);
    Group storage group = groups[groupHash];

    // The group has to be able to sum to >= 100%
    int256 req = _100_PERCENT_WEIGHT;
    for (uint256 i = 0; i < _approvers.length; i++) {
      Approver memory approver = _approvers[i];
      int256 weight = int256(uint256(approver.weight));

      if (weight > _100_PERCENT_WEIGHT) revert ApproverWeightExceedsMax();

      group.approvers[approver.addr] = weight;

      // Negative overflow not possible
      unchecked {
        req -= weight;
      }
    }

    if (req > 0) revert TotalWeightInsufficient();

    emit GroupAdded(_approvers);

    return groupHash;
  }

  function _isPrimaryApprover(bytes32 _groupHash) internal view returns (bool) {
    return groups[_groupHash].approvers[msg.sender] == _100_PERCENT_WEIGHT;
  }

  modifier onlySafe() {
    if (msg.sender != address(this)) revert OnlyCallableBySafe();
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
