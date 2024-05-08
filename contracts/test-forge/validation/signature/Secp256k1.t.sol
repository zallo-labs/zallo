// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {UnitTest} from 'test/UnitTest.sol';
import {Secp256k1} from 'src/validation/signature/Secp256k1.sol';

contract Secp256k1Test is UnitTest {
  function testFuzz_verify_HashSigned(uint256 signerKey, bytes32 hash) public pure {
    assumePk(signerKey);
    Secp256k1.Signature memory signature = sign(hash, signerKey);

    assertTrue(Secp256k1.verify(vm.addr(signerKey), hash, signature));
  }

  function testFuzz_verify_FailWhen_DifferentHash(bytes32 differentHash) public {
    bytes32 signedHash = bytes32(uint256(1));
    vm.assume(differentHash != signedHash);

    (address signer, uint256 signerKey) = makeAddrAndKey('signer');
    Secp256k1.Signature memory signature = sign(signedHash, signerKey);

    assertFalse(Secp256k1.verify(signer, differentHash, signature));
  }

  function testFuzz_verify_FailWhen_DifferentSigner(uint256 differentSignerKey) public {
    (, uint256 signerKey) = makeAddrAndKey('signer');
    assumePk(differentSignerKey);
    vm.assume(differentSignerKey != signerKey);

    bytes32 hash = bytes32(uint256(1));
    Secp256k1.Signature memory signature = sign(hash, signerKey);

    assertFalse(Secp256k1.verify(vm.addr(differentSignerKey), hash, signature));
  }
}
