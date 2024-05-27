// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

import {UnitTest} from 'test/UnitTest.sol';
import {K256} from 'src/validation/signature/K256.sol';

contract K256Test is UnitTest {
  function testFuzz_recover(uint256 signerKey, bytes32 hash) public pure {
    assumePk(signerKey);
    K256.Signature memory signature = sign(hash, signerKey);

    assertEq(K256.recover(hash, signature), vm.addr(signerKey));
  }
}
