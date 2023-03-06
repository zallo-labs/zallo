// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

library FunctionVerifier {
  error NotFunctionCall();
  error NotFunction(bytes4 expectedSelector, bytes4 actualSelector);
  error NotAnyOfFunctions(bytes4[] expectedAnyOfSelectors, bytes4 actualSelector);

  function verifyFunction(bytes4 selector, Transaction memory transaction) internal pure {
    bytes4 txSelector = _getSelector(transaction);
    if (txSelector != selector) revert NotFunction(selector, txSelector);
  }

  function verifyAnyOfFunctions(
    bytes4[] memory selectors,
    Transaction memory transaction
  ) internal pure {
    bytes4 txSelector = _getSelector(transaction);

    uint256 funcsLen = selectors.length;
    for (uint i; i < funcsLen; ) {
      if (selectors[i] == txSelector) return;

      unchecked {
        ++i;
      }
    }

    revert NotAnyOfFunctions(selectors, txSelector);
  }

  function _getSelector(Transaction memory transaction) private pure returns (bytes4 sighash) {
    if (transaction.data.length < 4) revert NotFunctionCall();
    sighash = bytes4(transaction.data);
  }
}
