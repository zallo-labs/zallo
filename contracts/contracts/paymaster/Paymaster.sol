// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.8;

import {IPaymaster, ExecutionResult, PAYMASTER_VALIDATION_SUCCESS_MAGIC} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymaster.sol';
import {BOOTLOADER_FORMAL_ADDRESS} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import {IPaymasterFlow} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymasterFlow.sol';
import {TransactionHelper, Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import {PaymasterManager} from './PaymasterManager.sol';
import {PriceOracle, PriceOracleConfig} from './PriceOracle.sol';
import {PaymasterUtil} from './PaymasterUtil.sol';
import {PaymasterParser} from './PaymasterParser.sol';
import {Cast} from '../libraries/Cast.sol';
import {Secp256k1} from '../libraries/Secp256k1.sol';

contract Paymaster is IPaymaster, PaymasterManager, PaymasterParser, PriceOracle {
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

  address public immutable _signer;

  /*//////////////////////////////////////////////////////////////
                             INITIALIZATION
  //////////////////////////////////////////////////////////////*/

  constructor(
    address owner,
    address signer,
    PriceOracleConfig memory oracleConfig
  ) PaymasterManager(owner) PriceOracle(oracleConfig) {
    _signer = signer;
  }

  /*//////////////////////////////////////////////////////////////
                                FALLBACK
  //////////////////////////////////////////////////////////////*/

  receive() external payable {
    _ethAllowance()[msg.sender] += msg.value;
  }

  /*//////////////////////////////////////////////////////////////
                               FUNCTIONS
  //////////////////////////////////////////////////////////////*/

  function validateAndPayForPaymasterTransaction(
    bytes32 /* txHash */,
    bytes32 /* txDataHash */,
    Transaction calldata transaction
  ) external payable onlyBootloader returns (bytes4 magic, bytes memory /* context */) {
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
      uint256 allowance = _ethAllowance()[from];
      if (allowance < amount) revert PaymentNotRecieved(from, token, amount);

      _ethAllowance()[from] = allowance - amount;
    } else {
      try IERC20(token).transferFrom(from, address(this), amount) returns (bool success) {
        if (!success) revert PaymentNotRecieved(from, token, amount);
      } catch {
        revert PaymentNotRecieved(from, token, amount);
      }
    }
  }

  /*//////////////////////////////////////////////////////////////
                                STORAGE
  //////////////////////////////////////////////////////////////*/

  function _ethAllowance() private pure returns (mapping(address => uint256) storage s) {
    assembly {
      // keccack256('Paymaster.ethAllowance')
      s.slot := 0x83f39f26ea023df7a049022a2132e47c1b07e9e164eab419384e126f5ce28735
    }
  }

  function ethAllowance(address account) external view returns (uint256 allowance) {
    return _ethAllowance()[account];
  }

  /*//////////////////////////////////////////////////////////////
                                MODIFIERS
  //////////////////////////////////////////////////////////////*/

  modifier onlyBootloader() {
    if (msg.sender != BOOTLOADER_FORMAL_ADDRESS) revert OnlyCallableByBootloader();
    _;
  }
}
