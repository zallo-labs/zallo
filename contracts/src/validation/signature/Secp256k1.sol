// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {ECDSA} from '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

library Secp256k1 {
  /// @notice Compact secp256k1 signature (https://eips.ethereum.org/EIPS/eip-2098)
  struct Signature {
    bytes32 r;
    bytes32 yParityAndS;
  }

  function verify(
    Signature memory signature,
    bytes32 hash,
    address signer
  ) internal pure returns (bool success) {
    (address recovered, ECDSA.RecoverError err, ) = ECDSA.tryRecover(
      hash,
      signature.r,
      signature.yParityAndS
    );

    return (err == ECDSA.RecoverError.NoError && recovered == signer);
  }
}
