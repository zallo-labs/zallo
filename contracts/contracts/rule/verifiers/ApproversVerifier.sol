// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {SignatureChecker as BaseSignatureChecker} from '@matterlabs/signature-checker/contracts/SignatureChecker.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

import {CONDITION_SUCCESS_MAGIC} from '../Rule.sol';

abstract contract ApproversVerifier {
  error ApproverSignaturesMismatch();
  error InvalidSignature(address approver);

  // TODO: accept approversHash + contractApprovers. Callback to a contractApprover if ecdsa recover fails
  function _verifyApprovers(
    address[] memory approvers,
    bytes32 txHash,
    bytes[] memory signatures
  ) public view {
    uint256 approversLength = approvers.length;
    if (approversLength != signatures.length) revert ApproverSignaturesMismatch();

    for (uint256 i; i < approversLength; ) {
      if (!_isValidSignerSignatureNow(approvers[i], txHash, signatures[i]))
        revert InvalidSignature(approvers[i]);

      unchecked {
        ++i;
      }
    }
  }

  function _isValidSignerSignatureNow(
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
