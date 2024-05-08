// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {ECDSA} from '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

library K256 {
  error FailedToRecoverSigner(ECDSA.RecoverError error);

  /// @notice Compact k256 (aka K-256) signature (https://eips.ethereum.org/EIPS/eip-2098)
  struct Signature {
    bytes32 r;
    bytes32 yParityAndS;
  }

  function verify(
    address signer,
    bytes32 hash,
    Signature memory signature
  ) internal pure returns (bool success) {
    return recover(hash, signature) == signer;
  }

  function recover(
    bytes32 hash,
    Signature memory signature
  ) internal pure returns (address signer) {
    ECDSA.RecoverError err;
    (signer, err, ) = ECDSA.tryRecover(hash, signature.r, signature.yParityAndS);

    if (err != ECDSA.RecoverError.NoError) revert FailedToRecoverSigner(err);
  }
}
