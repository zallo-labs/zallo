// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import 'forge-std/Test.sol'; // solhint-disable-line no-global-import
import {Secp256k1} from 'src/validation/signature/Secp256k1.sol';

abstract contract UnitTest is Test {
  function sign(
    uint256 privateKey,
    bytes32 hash
  ) internal pure returns (Secp256k1.Signature memory signature) {
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, hash);

    return Secp256k1.Signature({r: r, yParityAndS: (v == 27) ? s : s | bytes32(uint256(1) << 255)});
  }

  function assumePk(uint256 pk) internal pure {
    vm.assume(0 < pk);
    vm.assume(pk < 115792089237316195423570985008687907852837564279074904382605163141518161494337);
  }

  function makeKey(string memory name) internal returns (uint256 privateKey) {
    (, privateKey) = makeAddrAndKey(name);
  }
}
