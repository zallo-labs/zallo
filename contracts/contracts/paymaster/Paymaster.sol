// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.8;

import {IPaymaster, ExecutionResult, PAYMASTER_VALIDATION_SUCCESS_MAGIC} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymaster.sol';
import {BOOTLOADER_FORMAL_ADDRESS} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import {IPaymasterFlow} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymasterFlow.sol';
import {TransactionHelper, Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';

import {PriceOracle, PriceOracleConfig} from './PriceOracle.sol';
import {PaymasterUtil} from './PaymasterUtil.sol';
import {PaymasterParser} from './PaymasterParser.sol';
import {Cast} from '../libraries/Cast.sol';
import {Secp256k1} from '../libraries/Secp256k1.sol';

contract Paymaster is IPaymaster, Ownable, PaymasterParser, PriceOracle {
  /*//////////////////////////////////////////////////////////////
                                 EVENTS
  //////////////////////////////////////////////////////////////*/

  event RefundCredit(address indexed account, uint256 amount);

  /*//////////////////////////////////////////////////////////////
                                 ERRORS
  //////////////////////////////////////////////////////////////*/

  error OnlyCallableByBootloader();
  error PaymentNotRecieved(address from, address token, uint256 requiredAmount);
  error PaymasterLacksEth(uint256 requiredEth);

  /*//////////////////////////////////////////////////////////////
                               CONSTANTS
  //////////////////////////////////////////////////////////////*/

  uint256 constant POST_TRANSACTION_GAS_COST = 839;

  address immutable _signer;

  /*//////////////////////////////////////////////////////////////
                                STORAGE
  //////////////////////////////////////////////////////////////*/

  function _ethAllowances() private pure returns (mapping(address => uint256) storage s) {
    assembly {
      // keccack256('Paymaster.ethAllowances')
      s.slot := 0x568ab845212234734bb78a357931be0bbaa694f6ff1d487eb926d8b6243926d4
    }
  }

  /*//////////////////////////////////////////////////////////////
                             INITIALIZATION
  //////////////////////////////////////////////////////////////*/

  constructor(
    address owner,
    address signer,
    PriceOracleConfig memory oracleConfig
  ) Ownable(owner) PriceOracle(oracleConfig) {
    _signer = signer;
  }

  /*//////////////////////////////////////////////////////////////
                                FALLBACK
  //////////////////////////////////////////////////////////////*/

  fallback() external payable {
    if (msg.value > 0) {
      _ethAllowances()[msg.sender] += msg.value;
    }
  }

  /*//////////////////////////////////////////////////////////////
                               FUNCTIONS
  //////////////////////////////////////////////////////////////*/

  function validateAndPayForPaymasterTransaction(
    bytes32 /* txHash */,
    bytes32 /* txDataHash */,
    Transaction calldata transaction
  ) external payable onlyBootloader returns (bytes4 magic, bytes memory context) {
    magic = _unsafeValidateAndPayForPaymasterTransaction(transaction);
  }

  function _unsafeValidateAndPayForPaymasterTransaction(
    Transaction calldata transaction
  ) internal returns (bytes4 magic) {
    address from = address(uint160(transaction.from));
    (
      address token,
      uint256 allowance,
      uint256 paymasterFee,
      uint256 discount
    ) = _parsePaymasterInput(transaction.paymasterInput, _signer, from, transaction.nonce);

    uint256 bootloaderFee = transaction.gasLimit * transaction.maxFeePerGas;
    uint256 totalFeePreDiscount = bootloaderFee + paymasterFee;
    uint256 totalFee = (discount >= totalFeePreDiscount) ? 0 : totalFeePreDiscount - discount;
    uint256 requiredAmount = totalFee * _tokenPerEth(token);

    // Recieve payment
    // Fail rather than revert when allowance is insufficient; this allows gas estimation to work when user lacks tokens
    uint256 paymentAmount = allowance < requiredAmount ? allowance : requiredAmount;
    _receivePayment(from, token, paymentAmount);
    if (paymentAmount == requiredAmount) {
      magic = PAYMASTER_VALIDATION_SUCCESS_MAGIC;
    }

    // Pay bootloader
    (bool bootloaderPaid, ) = payable(BOOTLOADER_FORMAL_ADDRESS).call{value: bootloaderFee}('');
    if (!bootloaderPaid) revert PaymasterLacksEth(bootloaderFee);
  }

  function postTransaction(
    bytes calldata /* context */,
    Transaction calldata transaction,
    bytes32 /* txHash */,
    bytes32 /* txDataHash */,
    ExecutionResult /* txResult */,
    uint256 maxRefundedGas
  ) external payable onlyBootloader {
    _unsafePostTransaction(transaction, maxRefundedGas);
  }

  function _unsafePostTransaction(
    Transaction calldata transaction,
    uint256 maxRefundedGas /* gasLeft() before calling postTransaction() */
  ) internal {
    if (maxRefundedGas > POST_TRANSACTION_GAS_COST) {
      emit RefundCredit(
        address(uint160(transaction.from)),
        (maxRefundedGas - POST_TRANSACTION_GAS_COST) * transaction.maxFeePerGas
      );
    }
  }

  function _receivePayment(address from, address token, uint256 amount) private {
    if (amount == 0) return;

    if (token == ETH) {
      uint256 allowance = _ethAllowances()[from];
      if (allowance < amount) revert PaymentNotRecieved(from, token, amount);

      _ethAllowances()[from] = allowance - amount;
    } else {
      try IERC20(token).transferFrom(from, address(this), amount) returns (bool success) {
        if (!success) revert PaymentNotRecieved(from, token, amount);
      } catch {
        revert PaymentNotRecieved(from, token, amount);
      }
    }
  }

  /*//////////////////////////////////////////////////////////////
                                MODIFIERS
  //////////////////////////////////////////////////////////////*/

  modifier onlyBootloader() {
    if (msg.sender != BOOTLOADER_FORMAL_ADDRESS) revert OnlyCallableByBootloader();
    _;
  }
}
