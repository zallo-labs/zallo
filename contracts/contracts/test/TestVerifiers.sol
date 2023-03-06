// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

import {ApproversVerifier} from '../rule/verifiers/ApproversVerifier.sol';
import {FunctionVerifier} from '../rule/verifiers/FunctionVerifier.sol';
import {TargetVerifier} from '../rule/verifiers/TargetVerifier.sol';

contract TestVerifiers {
  /*//////////////////////////////////////////////////////////////
                           APPROVERS VERIFIER
  //////////////////////////////////////////////////////////////*/

  function verifyApprovers(
    address[] memory approvers,
    bytes32 hash,
    bytes[] memory signatures
  ) external view {
    ApproversVerifier.verifyApprovers(approvers, hash, signatures);
  }

  /*//////////////////////////////////////////////////////////////
                            FUNCTION VERIFIER
  //////////////////////////////////////////////////////////////*/

  function verifyFunction(bytes4 selector, Transaction memory transaction) external pure {
    FunctionVerifier.verifyFunction(selector, transaction);
  }

  function verifyAnyOfFunctions(
    bytes4[] memory selectors,
    Transaction memory transaction
  ) external pure {
    FunctionVerifier.verifyAnyOfFunctions(selectors, transaction);
  }

  /*//////////////////////////////////////////////////////////////
                             TARGET VERIFIER
  //////////////////////////////////////////////////////////////*/

  function verifyTarget(address target, Transaction memory transaction) external pure {
    TargetVerifier.verifyTarget(target, transaction);
  }

  function verifyAnyOfTargets(
    address[] memory targets,
    Transaction memory transaction
  ) external pure {
    TargetVerifier.verifyAnyOfTargets(targets, transaction);
  }
}
