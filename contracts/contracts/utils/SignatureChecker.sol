// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {
  SignatureChecker as BaseSignatureChecker
} from '@matterlabs/signature-checker/contracts/SignatureChecker.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

library SignatureChecker {
  function isValidSignatureNow(
    address signer,
    bytes32 hash,
    bytes memory signature
  ) internal view returns (bool) {
    // Compact (EIP-2098) signatures (https://eips.ethereum.org/EIPS/eip-2098)
    if (signature.length == 64) {
      bytes32 r;
      bytes32 vs;

      /// @solidity memory-safe-assembly
      assembly {
        r := mload(add(signature, 0x20))
        vs := mload(add(signature, 0x40))
      }

      (address recovered, ECDSA.RecoverError error) = ECDSA.tryRecover(hash, r, vs);

      if (error == ECDSA.RecoverError.NoError && recovered == signer) return true;
    }

    return BaseSignatureChecker.isValidSignatureNow(signer, hash, signature);
  }
}
