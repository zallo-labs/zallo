// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {MockPyth} from '@pythnetwork/pyth-sdk-solidity/MockPyth.sol'; // Include MockPyth in artifactrs

import {PriceOracle, PriceOracleConfig} from '../../paymaster/PriceOracle.sol';

contract TestPriceOracle is PriceOracle {
  constructor(PriceOracleConfig memory p) PriceOracle(p) {}

  function convert(
    uint256 amount,
    address fromToken,
    address toToken
  ) external view returns (uint256 converted) {
    return _convert(amount, fromToken, toToken);
  }
}
