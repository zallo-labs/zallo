// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

/* Constants */
// Fixed-point percentage with a precision of 28; e.g. 5.2% = 0.52 * (100 ** 27)
// int256 can safely hold ~7e47 uint96s
int256 constant THRESHOLD = 10**28;

/* Types */
/// @notice Approver belonging to a group
struct Approver {
  address addr;
  uint96 weight;
}

/// @notice Operation to be executed
struct Op {
  address payable to;
  uint256 value;
  bytes data;
  uint256 nonce;
}

interface ISafe {
  /* Events */
  event Received(address from, uint256 value);
  event Transaction(bytes32 txHash, bytes response);
  event TransactionReverted(bytes32 txHash, bytes response);
  event MultiTransaction(bytes32 txHash, bytes[] responses);
  event GroupUpserted(bytes32 groupId, Approver[] approvers);
  event GroupRemoved(bytes32 groupId);

  /* Errors */
  error ExecutionReverted();
  error TxAlreadyExecuted();
  error ApproversSignaturesLenMismatch();
  error InvalidSignature(address signer);
  error BelowThreshold();
  error InvalidProof();
  error ApproverHashesNotAscending();
  error OnlyCallableBySafe();

  /// @notice Execute an op
  /// @param _op Op to be executed
  /// @param _groupId ID of the group the approvers belong to
  /// @param _approvers Approvers approving the op
  /// @param _signatures Signatures of the approvers
  /// @param _proof Merkle proof of the group
  /// @param _proofFlags BoolArray of flags for the merkle proof
  /// @return response The response of the op
  function execute(
    Op calldata _op,
    bytes32 _groupId,
    Approver[] calldata _approvers,
    bytes[] calldata _signatures,
    bytes32[] calldata _proof,
    uint256[] calldata _proofFlags
  ) external returns (bytes memory response);

  /// @notice Execute multiple ops atomically
  /// @param _ops Ops to be executed
  /// @param _groupId ID of the group the approvers belong to
  /// @param _approvers Approvers approving the op
  /// @param _signatures Signatures of the approvers
  /// @param _proof Merkle proof of the group
  /// @param _proofFlags BoolArray of flags for the merkle proof
  /// @return responses The reponses of the ops
  function multiExecute(
    Op[] calldata _ops,
    bytes32 _groupId,
    Approver[] calldata _approvers,
    bytes[] calldata _signatures,
    bytes32[] calldata _proof,
    uint256[] calldata _proofFlags
  ) external returns (bytes[] memory responses);

  /// @notice Upsert (create or update) a group
  /// @dev Only callable by the safe
  /// @param _groupId ID of the group to be upserted
  /// @param _approvers Approvers to make up the group
  function upsertGroup(bytes32 _groupId, Approver[] calldata _approvers)
    external;

  /// @notice Remove a group
  /// @dev Only callable by the safe
  /// @param _groupId ID of the group to be removed
  function removeGroup(bytes32 _groupId) external;
}
