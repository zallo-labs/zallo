// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import 'forge-std/Test.sol'; // solhint-disable-line no-global-import

import {K256} from 'src/validation/signature/K256.sol';

abstract contract UnitTest is Test {
  uint256 internal constant JAN_1_2024 = 1704067200;

  function setUp() public virtual {
    vm.warp(JAN_1_2024); // Realistic timestamp
  }

  function assumePk(uint256 pk) internal pure {
    vm.assume(0 < pk && pk < SECP256K1_ORDER);
  }

  function sign(
    bytes32 hash,
    uint256 privateKey
  ) internal pure returns (K256.Signature memory signature) {
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, hash);

    return K256.Signature({r: r, yParityAndS: (v == 27) ? s : s | bytes32(uint256(1) << 255)});
  }

  function sign(
    bytes32 hash,
    uint256[] memory privateKeys
  ) internal pure returns (K256.Signature[] memory signatures) {
    signatures = new K256.Signature[](privateKeys.length);
    for (uint256 i; i < privateKeys.length; ++i) {
      signatures[i] = sign(hash, privateKeys[i]);
    }
  }

  function makeSigners(
    uint256 n
  ) internal returns (address[] memory signers, uint256[] memory signerKeys) {
    signers = new address[](n);
    signerKeys = new uint256[](n);
    for (uint256 i; i < n; ++i) {
      (address signer, uint256 signerKey) = makeAddrAndKey(
        string(abi.encodePacked('signer ', vm.toString(i)))
      );
      signers[i] = signer;
      signerKeys[i] = signerKey;
    }

    // Sort asc by address
    for (uint256 i = 1; i < n; i++) {
      for (uint256 j = i; j > 0; --j) {
        if (signers[j] < signers[j - 1]) {
          (signers[j], signers[j - 1]) = (signers[j - 1], signers[j]);
          (signerKeys[j], signerKeys[j - 1]) = (signerKeys[j - 1], signerKeys[j]);
        }
      }
    }
  }
}
