// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction, TransactionHelper} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import {IPaymasterFlow, PaymasterSignedData} from './IPaymasterFlow.sol';
import {Secp256k1} from '../libraries/Secp256k1.sol';

/* payForTransaction encoded params
 *
 * 0x6a06295f                                                          # selector
 * 000000000000000000000000aa675101540cbeb6cc43b15a10ba5f770e236c54    # token
 * 0000000000000000000000000000000000000000000000000000000000000001    # allowance
 * 0000000000000000000000000000000000000000000000000000000000000002    # paymasterFee
 * 0000000000000000000000000000000000000000000000000000000000000003    # discount
 * c7d7400ed486c2b5c356b08c666764bb2dde554f2e85ee51a1c87b410bfcfc47    # paymasterSignature.r
 * 1ee585dea876238d0dcb807d4acac8bb4ccdda24f6d68b8e0f41c98a0fc1ff7c    # paymasterSignature.yParityAndS
 */

library PaymasterUtil {
  /*//////////////////////////////////////////////////////////////
                                 ERRORS
  //////////////////////////////////////////////////////////////*/

  error MissingPaymasterSelector();

  /*//////////////////////////////////////////////////////////////
                               FUNCTIONS
  //////////////////////////////////////////////////////////////*/

  function signedInput(
    bytes calldata paymasterInput
  ) internal pure returns (bytes memory signedInput) {
    if (
      paymasterInput.length < 4 ||
      selector(paymasterInput) != IPaymasterFlow.payForTransaction.selector
    ) return paymasterInput;

    address token = address(bytes20(paymasterInput[16:36]));
    uint256 paymasterFee = uint256(bytes32(paymasterInput[68:100]));

    return abi.encode(token, paymasterFee);
  }

  function processPaymasterInput(Transaction calldata transaction) internal {
    if (selector(transaction.paymasterInput) != IPaymasterFlow.payForTransaction.selector)
      return TransactionHelper.processPaymasterInput(transaction);

    (address token, uint256 allowance) = abi.decode(
      transaction.paymasterInput[4:68],
      (address, uint256)
    );
    address paymaster = address(uint160(transaction.paymaster));

    if (allowance == 0) return;

    if (token == address(0)) {
      // ETH
      (bool success, ) = paymaster.call{value: allowance}('');
      require(success);
    } else {
      // ERC20
      // Note. this does *not* support tokens that require setting approval to 0 first e.g. USDT
      IERC20(token).approve(paymaster, allowance); // Overwrites prior allowance
    }
  }

  function selector(bytes calldata paymasterInput) internal pure returns (bytes4 selector_) {
    if (paymasterInput.length < 4) revert MissingPaymasterSelector();
    return bytes4(paymasterInput[0:4]);
  }
}
