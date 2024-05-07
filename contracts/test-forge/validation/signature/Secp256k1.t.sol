// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {UnitTest} from 'test/UnitTest.t.sol';
import {Secp256k1} from 'src/validation/signature/Secp256k1.sol';

contract Secp256k1Test is UnitTest {
  function testFuzz_verify_HashSigned(uint256 signer, bytes32 hash) public pure {
    assumePk(signer);
    Secp256k1.Signature memory signature = sign(signer, hash);

    assertTrue(Secp256k1.verify(signature, hash, vm.addr(signer)));
  }

  function testFuzz_verify_FailWhen_DifferentHash(bytes32 differentHash) public {
    bytes32 signedHash = bytes32(uint256(1));
    vm.assume(differentHash != signedHash);

    (address signer, uint256 signerKey) = makeAddrAndKey('signer');
    Secp256k1.Signature memory signature = sign(signerKey, signedHash);

    assertFalse(Secp256k1.verify(signature, differentHash, signer));
  }

  function testFuzz_verify_FailWhen_DifferentSigner(uint256 differentSigner) public {
    uint256 signerKey = makeKey('signer');
    assumePk(differentSigner);
    vm.assume(differentSigner != signerKey);

    bytes32 hash = bytes32(uint256(1));
    Secp256k1.Signature memory signature = sign(signerKey, hash);

    assertFalse(Secp256k1.verify(signature, hash, vm.addr(differentSigner)));
  }
}
