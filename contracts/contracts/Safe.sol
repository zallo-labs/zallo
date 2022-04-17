// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import 'hardhat/console.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

import './Types.sol';
import './EIP712.sol';

contract Safe is EIP712 {
  bytes32 private constant TX_TYPEHASH =
    keccak256('Tx(address to,uint256 value,bytes data,uint256 nonce)');

  // Fixed-point percentage with a precision of 28; e.g. 5.2% = 0.52 * 10 ** 28
  // A int256 can safely hold ~7e47 uint96s (min. bytes required to store the precision)
  int256 private constant _100_PERCENT = 10**28;

  mapping(bytes32 => Group) groups;
  mapping(bytes32 => bool) public txHashSeen;

  /* Events */
  event Deposit(address from, uint256 value);
  event Execution(Tx tx, bytes32 groupHash, address[] approvers, address executor, bytes response);
  event GroupAdded(Approver[] approvers);
  event GroupRemoved(bytes32 groupHash);

  /* Errors */
  error OnlyCallableBySafe();
  error NotPrimaryApprover();

  error ApproverWeightExceeds100Percent();
  error TotalGroupWeightLessThan100Percent();

  error SignaturesNotAscending();
  error ApproversNotAscending();

  error TxAlreadyExecuted();
  error ApproverNotInGroup(address approver);
  error TotalApprovalWeightsInsufficient();
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
    signaturesUniqueAndSortedAsc(_st.signatures)
    returns (bytes memory response)
  {
    address[] memory approvers = _verify(_st.tx, _groupHash, _st.signatures);

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

  function addGroup(Approver[] calldata _approvers) external onlySafe returns (bytes32) {
    return _addGroup(_approvers);
  }

  function removeGroup(bytes32 _groupHash) external onlySafe {
    delete groups[_groupHash];
    emit GroupRemoved(_groupHash);
  }

  function hashTx(Tx calldata _tx) public view returns (bytes32) {
    bytes32 txHash = keccak256(
      abi.encode(TX_TYPEHASH, _tx.to, _tx.value, keccak256(_tx.data), _tx.nonce)
    );

    return ECDSA.toTypedDataHash(domainSeparator(), txHash);
  }

  function hashGroup(Approver[] memory _approvers) public pure returns (bytes32) {
    return keccak256(abi.encode(_approvers));
  }

  function recoverAddress(bytes32 _hash, bytes memory _signature) public pure returns (address) {
    return ECDSA.recover(_hash, _signature);
  }

  function _verify(
    Tx calldata _tx,
    bytes32 _groupHash,
    bytes[] calldata _signatures
  ) internal returns (address[] memory approvers) {
    if (_signatures.length == 0) {
      if (!_isPrimaryApprover(_groupHash)) revert NotPrimaryApprover();

      approvers = new address[](1);
      approvers[0] = msg.sender;

      // Note. txHash not marked as seen for PA executions
    } else {
      approvers = _verifySignatures(_tx, _groupHash, _signatures);
    }
  }

  function _verifySignatures(
    Tx calldata _tx,
    bytes32 _groupHash,
    bytes[] calldata _signatures
  ) internal returns (address[] memory approvers) {
    bytes32 txHash = hashTx(_tx);
    if (txHashSeen[txHash]) revert TxAlreadyExecuted();
    txHashSeen[txHash] = true;

    Group storage group = groups[_groupHash];
    approvers = new address[](_signatures.length);

    int256 req = _100_PERCENT;
    for (uint256 i = 0; req > 0 && i < _signatures.length; i++) {
      approvers[i] = recoverAddress(txHash, _signatures[i]);

      uint256 weight = group.approvers[approvers[i]];
      if (weight == 0) revert ApproverNotInGroup(approvers[i]);

      // This can't overflow; see _100_PERCENT
      unchecked {
        req -= int256(weight);
      }
    }

    if (req > 0) revert TotalApprovalWeightsInsufficient();
  }

  function _call(Tx calldata _tx) internal returns (bytes memory) {
    (bool success, bytes memory response) = _tx.to.call{value: _tx.value}(_tx.data);

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
    int256 req = _100_PERCENT;
    for (uint256 i = 0; i < _approvers.length; i++) {
      Approver memory approver = _approvers[i];

      if (approver.weight > uint256(_100_PERCENT)) revert ApproverWeightExceeds100Percent();

      group.approvers[approver.addr] = approver.weight;

      // This can't overflow; see _100_PERCENT
      unchecked {
        req -= int256(approver.weight);
      }
    }

    if (req > 0) revert TotalGroupWeightLessThan100Percent();

    emit GroupAdded(_approvers);

    return groupHash;
  }

  function _isPrimaryApprover(bytes32 _groupHash) internal view returns (bool) {
    return groups[_groupHash].approvers[msg.sender] == uint256(_100_PERCENT);
  }

  modifier onlySafe() {
    if (msg.sender != address(this)) revert OnlyCallableBySafe();
    _;
  }

  modifier signaturesUniqueAndSortedAsc(bytes[] calldata _signatures) {
    // Gas efficient way to assert that _signatures is a unique set
    for (uint256 i = 1; i < _signatures.length; i++) {
      if (keccak256(_signatures[i - 1]) >= keccak256(_signatures[i]))
        revert SignaturesNotAscending();
    }
    _;
  }

  modifier approversUniqueAndSortedAsc(Approver[] memory _approvers) {
    // Gas efficient way to assert that _approvers is a unique set
    for (uint256 i = 1; i < _approvers.length; i++) {
      if (_approvers[i - 1].addr >= _approvers[i].addr) revert ApproversNotAscending();
    }
    _;
  }
}
