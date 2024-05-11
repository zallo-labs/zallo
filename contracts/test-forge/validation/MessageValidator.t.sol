// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {UnitTest} from 'test/UnitTest.sol';
import {MessageValidator} from 'src/validation/MessageValidator.sol';
import {Policy} from 'src/validation/Policy.sol';
import {Approvals} from 'src/validation/Approvals.sol';
import {PolicyLib} from 'src/validation/Policy.sol';

contract MessageValidatorTest is UnitTest, MessageValidator {
  function testFuzz_isValidSignature_HashAndSigMatch(bytes memory message) public {
    (address[] memory approvers, uint256[] memory approverKeys) = makeSigners(1);
    Approvals memory approvals;
    approvals.k256 = sign(_signedMessageHash(message), approverKeys);

    Policy memory policy;
    policy.approvers = approvers;
    policy.threshold = 1;
    _setPolicy(policy);

    assertEq(
      this.isValidSignature(keccak256(message), abi.encode(message, policy, approvals)),
      bytes4(0x1626ba7e)
    );
  }

  function testFuzz_isValidSignature_RevertWhen_PolicyNotVerified(bytes memory message) public {
    (address[] memory approvers, uint256[] memory approverKeys) = makeSigners(1);
    Approvals memory approvals;
    approvals.k256 = sign(_signedMessageHash(message), approverKeys);

    Policy memory policy;
    policy.approvers = approvers;
    policy.threshold = 1;

    vm.expectRevert(
      abi.encodeWithSelector(
        PolicyLib.PolicyDoesNotMatchExpectedHash.selector,
        PolicyLib.hash(policy),
        bytes32(0)
      )
    );
    this.isValidSignature(keccak256(message), abi.encode(message, policy, approvals));
  }

  function testFuzz_isValidSignature_RevertWhen_MessageDoesNotMatchHash(
    bytes32 wrongHash,
    bytes memory message
  ) public {
    vm.assume(wrongHash != keccak256(message));

    (address[] memory approvers, uint256[] memory approverKeys) = makeSigners(1);
    Approvals memory approvals;
    approvals.k256 = sign(_signedMessageHash(message), approverKeys);

    Policy memory policy;
    policy.approvers = approvers;
    policy.threshold = 1;
    _setPolicy(policy);

    vm.expectRevert(MessageValidator.WrongMessageInSignature.selector);
    this.isValidSignature(wrongHash, abi.encode(message, policy, approvals));
  }

  function testFail_isValidSignature_RevertWhen_WrongSignedHash(
    bytes32 wrongSignedHash,
    bytes memory message
  ) public {
    vm.assume(wrongSignedHash != _signedMessageHash(message));

    (address[] memory approvers, uint256[] memory approverKeys) = makeSigners(1);
    Approvals memory approvals;
    approvals.k256 = sign(wrongSignedHash, approverKeys);

    Policy memory policy;
    policy.approvers = approvers;
    policy.threshold = 1;
    _setPolicy(policy);

    // vm.expectRevert(abi.encodeWithSelector(ApprovalsLib.InvalidSignature.selector, approvers[0]));
    this.isValidSignature(keccak256(message), abi.encode(message, policy, approvals));
  }

  function testFail_isValidSignature_RevertWhen_MessageHashSigned(bytes memory message) public {
    (address[] memory approvers, uint256[] memory approverKeys) = makeSigners(1);
    Approvals memory approvals;
    approvals.k256 = sign(keccak256(message), approverKeys);

    Policy memory policy;
    policy.approvers = approvers;
    policy.threshold = 1;
    _setPolicy(policy);

    // vm.expectRevert(abi.encodeWithSelector(ApprovalsLib.InvalidSignature.selector, approvers[0]));
    this.isValidSignature(keccak256(message), abi.encode(message, policy, approvals));
  }

  function _setPolicy(Policy memory policy) private {
    PolicyLib.hashes()[policy.key] = PolicyLib.hash(policy);
  }
}
