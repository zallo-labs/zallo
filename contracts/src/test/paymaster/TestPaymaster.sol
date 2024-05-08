// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {Transaction as SystemTransaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
import {Paymaster, PriceOracleConfig} from 'src/paymaster/Paymaster.sol';

contract TestPaymaster is Paymaster {
  constructor(
    address owner,
    address signer,
    PriceOracleConfig memory oracleConfig
  ) Paymaster(owner, signer, oracleConfig) {}

  function testValidateAndPayForPaymasterTransaction(
    SystemTransaction calldata transaction
  ) external returns (bytes4 magic) {
    return _unsafeValidateAndPayForPaymasterTransaction(transaction);
  }

  function testPostTransaction(
    SystemTransaction calldata transaction,
    uint256 maxRefundedGas
  ) external {
    _unsafePostTransaction(transaction, maxRefundedGas);
  }

  function testPostTransactionGasUsed(
    SystemTransaction calldata transaction,
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
