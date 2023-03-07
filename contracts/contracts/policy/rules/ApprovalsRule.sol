// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {SignatureChecker as BaseSignatureChecker} from '@matterlabs/signature-checker/contracts/SignatureChecker.sol';
import {ECDSA} from '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

library ApprovalsRule {
  error ApproverSignaturesMismatch();
  error InvalidSignature(address approver);

  // TODO: accept approversHash + contractApprovers. Callback to a contractApprover if ecdsa recover fails
  /// Expects signatures[i] to be for approvers[i]
  function verifyApprovals(
    address[] memory approvers,
    bytes32 hash,
    bytes[] memory signatures
  ) internal view {
    uint256 approversLength = approvers.length;
    if (approversLength != signatures.length) revert ApproverSignaturesMismatch();

    for (uint256 i; i < approversLength; ) {
      if (!_isApproverSignatureValidNow(approvers[i], hash, signatures[i]))
        revert InvalidSignature(approvers[i]);

      unchecked {
        ++i;
      }
    }
  }

  function _isApproverSignatureValidNow(
    address signer,
    bytes32 hash,
    bytes memory signature
  ) private view returns (bool) {
    // Compact (EIP-2098) signatures (https://eips.ethereum.org/EIPS/eip-2098)
    // Signature mutability isn't an issue since signer signatures aren't used to protect against replay attacks
    if (signature.length == 64) {
      bytes32 r;
      bytes32 vs;

      /// @solidity memory-safe-assembly
      assembly {
        r := mload(add(signature, 0x20))
        vs := mload(add(signature, 0x40))
      }

      (address recovered, ECDSA.RecoverError err) = ECDSA.tryRecover(hash, r, vs);

      if (err == ECDSA.RecoverError.NoError && recovered == signer) return true;
    }

    return BaseSignatureChecker.isValidSignatureNow(signer, hash, signature);
  }
}
