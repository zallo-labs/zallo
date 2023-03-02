// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

abstract contract MatchingFunctionVerifier {
  error NotFunctionCall();
  error DidNotMatchFunction(bytes4 actual, bytes4 expected);
  error DidNotMatchAnyFunctions(bytes4[] functions, bytes4 sighash);

  function _verifyMatchingFunction(bytes4 func, Transaction memory transaction) public pure {
    bytes4 sighash = _getSighash(transaction);
    if (sighash != func) revert DidNotMatchFunction(sighash, func);
  }

  function _verifyMatchingAnyFunction(
    bytes4[] memory functions,
    Transaction memory transaction
  ) public pure {
    bytes4 sighash = _getSighash(transaction);

    uint256 funcsLen = functions.length;
    for (uint i; i < funcsLen; ) {
      if (functions[i] == sighash) return;

      unchecked {
        ++i;
      }
    }

    revert DidNotMatchAnyFunctions(functions, sighash);
  }

  function _getSighash(Transaction memory transaction) private pure returns (bytes4 sighash) {
    if (transaction.data.length < 4) revert NotFunctionCall();
    sighash = bytes4(transaction.data);
  }
}
