// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.20;

import 'forge-std/Test.sol'; // solhint-disable-line no-global-import
import {Secp256k1} from 'src/libraries/Secp256k1.sol';

abstract contract TestUtil is Test {
  function sign(
    uint256 privateKey,
    bytes32 digest
  ) internal pure returns (Secp256k1.Signature memory signature) {
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);

    return Secp256k1.Signature({r: r, yParityAndS: (v == 27) ? s : s | bytes32(uint256(1) << 255)});
  }
}
