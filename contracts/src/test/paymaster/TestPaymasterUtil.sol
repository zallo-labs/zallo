// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {PaymasterParser} from '~/paymaster/PaymasterParser.sol';
import {PaymasterUtil, Transaction} from '~/paymaster/PaymasterUtil.sol';
import {PaymasterSignedData} from '~/paymaster/IPaymasterFlow.sol';

contract TestPaymasterUtil is PaymasterParser {
  /*//////////////////////////////////////////////////////////////
                            PAYMASTER PARSER
  //////////////////////////////////////////////////////////////*/

  function parsePaymasterInput(
    bytes calldata paymasterInput,
    address paymasterSigner,
    address account,
    uint256 nonce
  )
    external
    view
    returns (address token, uint256 allowance, uint256 paymasterFee, uint256 discount)
  {
    return _parsePaymasterInput(paymasterInput, paymasterSigner, account, nonce);
  }

  function hashSignedData(
    address account,
    uint256 nonce,
    PaymasterSignedData memory signedData
  ) external view returns (bytes32 hash) {
    return _hashSignedData(account, nonce, signedData);
  }

  /*//////////////////////////////////////////////////////////////
                             PAYMASTER UTIL
  //////////////////////////////////////////////////////////////*/

  function signedInput(
    bytes calldata paymasterInput
  ) external pure returns (bytes memory signedInput_) {
    return PaymasterUtil.signedInput(paymasterInput);
  }

  function processPaymasterInput(Transaction calldata transaction) external {
    return PaymasterUtil.processPaymasterInput(transaction);
  }
}
