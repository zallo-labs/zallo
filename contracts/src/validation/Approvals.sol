// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {Policy} from './Policy.sol';
import {ERC1271} from './signature/ERC1271.sol';
import {K256} from './signature/K256.sol';

struct Approvals {
  K256.Signature[] k256;
  ERC1271Approval[] erc1271;
}

struct ERC1271Approval {
  uint16 approverIndex;
  bytes signature;
}

library ApprovalsLib {
  error InvalidSignature(address approver);
  error ApproverNotFound(uint16 approverIndex);

  function verify(
    Approvals memory a,
    bytes32 hash,
    Policy memory p
  ) internal view returns (bool success) {
    uint256 approvals = a.k256.length + a.erc1271.length;
    if (approvals < p.threshold) return false;

    verifyK256(hash, p.approvers, a.k256);
    verifyErc1271(hash, p.approvers, a.erc1271);

    return true;
  }

  function verifyK256(
    bytes32 hash,
    address[] memory approvers,
    K256.Signature[] memory signatures
  ) internal pure {
    uint256 approverIndex /* = 0 */;
    address approver;
    bool found;
    for (uint256 i; i < signatures.length; ++i) {
      approver = K256.recover(hash, signatures[i]);

      // Ensures k256 signatures are ascending (thus unique) and part of the approver set
      for (found = false; !found && approverIndex < approvers.length; ++approverIndex) {
        if (approvers[approverIndex] == approver) found = true;
      }

      if (!found) revert InvalidSignature(approver);
    }
  }

  function verifyErc1271(
    bytes32 hash,
    address[] memory approvers,
    ERC1271Approval[] memory approvals
  ) internal view {
    address approver;
    address lastApprover /* = 0 */;
    for (uint256 i = 0; i < approvals.length; ++i) {
      if (approvals[i].approverIndex >= approvers.length)
        revert ApproverNotFound(approvals[i].approverIndex);

      // Ensure erc1271 signatures are ascending (thus unique)
      approver = approvers[approvals[i].approverIndex];
      if (approver <= lastApprover) revert InvalidSignature(approver);
      lastApprover = approver;

      if (!ERC1271.verify(approver, hash, approvals[i].signature)) {
        revert InvalidSignature(approver);
      }
    }
  }
}
