// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

import {ApprovalsRule} from '../policy/rules/ApprovalsRule.sol';
import {FunctionRule} from '../policy/rules/FunctionRule.sol';
import {TargetRule} from '../policy/rules/TargetRule.sol';

contract TestRules {
  /*//////////////////////////////////////////////////////////////
                           APPROVERS VERIFIER
  //////////////////////////////////////////////////////////////*/

  function verifyApprovers(
    address[] memory approvers,
    bytes32 hash,
    bytes[] memory signatures
  ) external view {
    ApprovalsRule.verifyApprovals(approvers, hash, signatures);
  }

  /*//////////////////////////////////////////////////////////////
                            FUNCTION VERIFIER
  //////////////////////////////////////////////////////////////*/

  function verifyFunction(bytes4 selector, Transaction memory transaction) external pure {
    FunctionRule.verifyFunction(selector, transaction);
  }

  function verifyAnyOfFunctions(
    bytes4[] memory selectors,
    Transaction memory transaction
  ) external pure {
    FunctionRule.verifyAnyOfFunctions(selectors, transaction);
  }

  /*//////////////////////////////////////////////////////////////
                             TARGET VERIFIER
  //////////////////////////////////////////////////////////////*/

  function verifyTarget(address target, Transaction memory transaction) external pure {
    TargetRule.verifyTarget(target, transaction);
  }

  function verifyAnyOfTargets(
    address[] memory targets,
    Transaction memory transaction
  ) external pure {
    TargetRule.verifyAnyOfTargets(targets, transaction);
  }
}
