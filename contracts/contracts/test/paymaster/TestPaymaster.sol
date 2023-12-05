// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Paymaster, PriceOracleConfig, Transaction} from '../../paymaster/Paymaster.sol';

contract TestPaymaster is Paymaster {
  constructor(
    address owner,
    address signer,
    PriceOracleConfig memory oracleConfig
  ) Paymaster(owner, signer, oracleConfig) {}

  function testValidateAndPayForPaymasterTransaction(
    Transaction calldata transaction
  ) external returns (bytes4 magic) {
    return _unsafeValidateAndPayForPaymasterTransaction(transaction);
  }

  function testPostTransaction(Transaction calldata transaction, uint256 maxRefundedGas) external {
    _unsafePostTransaction(transaction, maxRefundedGas);
  }

  function testPostTransactionGasUsed(
    Transaction calldata transaction,
    uint256 maxRefundedGas
  ) external returns (uint256 gasUsed) {
    uint256 initialGasLeft = gasleft();

    _unsafePostTransaction(transaction, maxRefundedGas);

    gasUsed = initialGasLeft - gasleft();
    require(gasUsed <= POST_TRANSACTION_GAS_COST);
  }

  function postTransactionGasCost() external pure returns (uint256) {
    return POST_TRANSACTION_GAS_COST;
  }
}
