// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {IERC1271} from '@openzeppelin/contracts/interfaces/IERC1271.sol';

import {UnitTest} from 'test/UnitTest.sol';
import {Approvals, ApprovalsLib, ERC1271Approval} from 'src/validation/Approvals.sol';
import {Secp256k1} from 'src/validation/signature/Secp256k1.sol';
import {Policy} from 'src/validation/Policy.sol';

contract TestApprovalsVerify is UnitTest {
  function testFuzz_verify_SufficientApprovals(bytes32 hash, uint8 n, uint8 threshold) public {
    vm.assume(n >= threshold);

    (
      address[] memory approvers,
      Secp256k1.Signature[] memory secp256k1Approvals
    ) = _secp256k1Approve(hash, n);

    Approvals memory approvals;
    approvals.secp256k1 = secp256k1Approvals;

    Policy memory policy;
    policy.approvers = approvers;
    policy.threshold = threshold;

    vm.assertTrue(ApprovalsLib.verify(approvals, hash, policy));
  }

  function testFuzz_verify_FailWhen_SufficientApprovals(bytes32 hash, uint8 n, uint8 threshold) public {
    vm.assume(n < threshold);

    (
      address[] memory approvers,
      Secp256k1.Signature[] memory secp256k1Approvals
    ) = _secp256k1Approve(hash, n);

    Approvals memory approvals;
    approvals.secp256k1 = secp256k1Approvals;

    Policy memory policy;
    policy.approvers = approvers;
    policy.threshold = threshold;

    vm.assertFalse(ApprovalsLib.verify(approvals, hash, policy));
  }

  /* ---------------------------------------------------------------------- */

  function testFuzz_verifySecp256k1_ApprovalsValid(bytes32 hash) public {
    (address[] memory approvers, Secp256k1.Signature[] memory approvals) = _secp256k1Approve(
      hash,
      2
    );

    ApprovalsLib.verifySecp256k1(hash, approvers, approvals);
  }

  function testFail_verifySecp256k1_RevertWhen_DifferentHash(bytes32 differentHash) public {
    bytes32 hash = bytes32(uint256(1));
    vm.assume(differentHash != hash);

    (address[] memory approvers, Secp256k1.Signature[] memory approvals) = _secp256k1Approve(
      hash,
      2
    );

    // vm.expectRevert(ApprovalsLib.InvalidSignature.selector);
    // Can't expectRevert due to internal precompile call (ecrecover)
    ApprovalsLib.verifySecp256k1(differentHash, approvers, approvals);
  }

  function testFail_verifySecp256k1_RevertWhen_NotApprover() public {
    bytes32 hash = bytes32(uint256(1));
    (address[] memory approvers, Secp256k1.Signature[] memory approvals) = _secp256k1Approve(
      hash,
      2
    );

    address[] memory partialApprovers = new address[](approvers.length - 1);
    for (uint256 i = 0; i < approvers.length - 1; ++i) {
      partialApprovers[i] = approvers[i];
    }

    // vm.expectRevert(ApprovalsLib.InvalidSignature.selector);
    ApprovalsLib.verifySecp256k1(hash, partialApprovers, approvals);
  }

  function testFail_verifySecp256k1_RevertWhen_DuplicatedApproval() public {
    bytes32 hash = bytes32(uint256(1));
    (address[] memory approvers, Secp256k1.Signature[] memory approvals) = _secp256k1Approve(
      hash,
      2
    );

    approvals[1] = approvals[0];

    // vm.expectRevert(ApprovalsLib.InvalidSignature.selector);
    ApprovalsLib.verifySecp256k1(hash, approvers, approvals);
  }

  function _secp256k1Approve(
    bytes32 hash,
    uint256 n
  ) internal returns (address[] memory approvers, Secp256k1.Signature[] memory approvals) {
    uint256[] memory signerKeys;
    (approvers, signerKeys) = makeSigners(n);
    approvals = sign(hash, signerKeys);
  }

  /* ---------------------------------------------------------------------- */

  function test_verifyErc1271_ApprovalsValid() public {
    (address[] memory approvers, ERC1271Approval[] memory approvals) = _erc1271Approvals(2);

    ApprovalsLib.verifyErc1271(bytes32(uint256(1)), approvers, approvals);
  }

  function testFail_verifyErc1271_RevertWhen_ApprovalVerifyFails(bytes memory revertReason) public {
    (address[] memory approvers, ERC1271Approval[] memory approvals) = _erc1271Approvals(2);

    vm.mockCallRevert(
      approvers[0],
      abi.encodeWithSelector(IERC1271.isValidSignature.selector),
      revertReason
    );

    // vm.expectRevert(ApprovalsLib.InvalidSignature.selector);
    // Can't expectRevert due to internal call
    ApprovalsLib.verifyErc1271(bytes32(uint256(1)), approvers, approvals);
  }

  function test_verifyErc1271_RevertWhen_NotApprover() public {
    (, ERC1271Approval[] memory approvals) = _erc1271Approvals(1);
    address[] memory partialApprovers = new address[](0);

    vm.expectRevert(abi.encodeWithSelector(ApprovalsLib.ApproverNotFound.selector, 0));
    ApprovalsLib.verifyErc1271(bytes32(uint256(1)), partialApprovers, approvals);
  }

  function testFail_verifyErc1271_RevertWhen_DuplicatedApproval() public {
    (address[] memory approvers, ERC1271Approval[] memory approvals) = _erc1271Approvals(2);

    approvals[1].approverIndex = approvals[0].approverIndex;

    // vm.expectRevert(ApprovalsLib.InvalidSignature.selector);
    ApprovalsLib.verifyErc1271(bytes32(uint256(1)), approvers, approvals);
  }

  function _erc1271Approvals(
    uint256 n
  ) internal returns (address[] memory approvers, ERC1271Approval[] memory approvals) {
    (approvers, ) = makeSigners(n);
    approvals = new ERC1271Approval[](n);

    for (uint16 i = 0; i < n; ++i) {
      vm.mockCall(
        approvers[i],
        abi.encodeWithSelector(IERC1271.isValidSignature.selector),
        abi.encode(IERC1271.isValidSignature.selector)
      );
      approvals[i].approverIndex = i;
      approvals[i].signature = abi.encode(true);
    }
  }
}
