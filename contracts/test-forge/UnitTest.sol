// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import 'forge-std/Test.sol'; // solhint-disable-line no-global-import
import {Secp256k1} from 'src/validation/signature/Secp256k1.sol';

abstract contract UnitTest is Test {
  function assumePk(uint256 pk) internal pure {
    vm.assume(0 < pk);
    vm.assume(pk < 115792089237316195423570985008687907852837564279074904382605163141518161494337);
  }

  function sign(
    bytes32 hash,
    uint256 privateKey
  ) internal pure returns (Secp256k1.Signature memory signature) {
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, hash);

    return Secp256k1.Signature({r: r, yParityAndS: (v == 27) ? s : s | bytes32(uint256(1) << 255)});
  }

  function sign(
    bytes32 hash,
    uint256[] memory privateKeys
  ) internal pure returns (Secp256k1.Signature[] memory signatures) {
    signatures = new Secp256k1.Signature[](privateKeys.length);
    for (uint256 i = 0; i < privateKeys.length; ++i) {
      signatures[i] = sign(hash, privateKeys[i]);
    }
  }

  function makeSigners(
    uint256 n
  ) internal returns (address[] memory signers, uint256[] memory signerKeys) {
    signers = new address[](n);
    signerKeys = new uint256[](n);
    for (uint256 i = 0; i < n; ++i) {
      (address signer, uint256 signerKey) = makeAddrAndKey(
        string(abi.encodePacked('signer ', vm.toString(i)))
      );
      signers[i] = signer;
      signerKeys[i] = signerKey;
    }

    // Sort asc by address
    for (uint256 i = 0; n > 0 && i < n - 1; i++) {
      for (uint256 j = i + 1; j < n; j++) {
        if (signers[i] > signers[j]) {
          (signers[i], signers[j]) = (signers[j], signers[i]);
          (signerKeys[i], signerKeys[j]) = (signerKeys[j], signerKeys[i]);
        }
      }
    }
  }
}
