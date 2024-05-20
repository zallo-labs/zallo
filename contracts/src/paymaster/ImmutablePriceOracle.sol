// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

import {PriceOracle} from './PriceOracle.sol';

abstract contract ImmutablePriceOracle is PriceOracle {
  error UnsupportedToken(address token);

  uint8 private constant PRICE_DECIMALS = 18;
  uint256 private constant IDENTITY_RATE = 1 * 10 ** PRICE_DECIMALS;

  address internal immutable NATIVE = address(0);
  uint8 internal immutable NATIVE_DECIMALS = 18;
  bytes32 internal immutable NATIVE_PRICE_ID;
  address internal immutable DAI;
  uint8 internal immutable DAI_DECIMALS = 18;
  bytes32 internal immutable DAI_PRICE_ID;
  address internal immutable USDC;
  uint8 internal immutable USDC_DECIMALS = 6;
  bytes32 internal immutable USDC_PRICE_ID;
  address internal immutable WETH;
  uint8 internal immutable WETH_DECIMALS = 18;
  bytes32 internal immutable WETH_PRICE_ID;
  address internal immutable RETH;
  uint8 internal immutable RETH_DECIMALS = 18;
  bytes32 internal immutable RETH_PRICE_ID;
  address internal immutable CBETH;
  uint8 internal immutable CBETH_DECIMALS = 18;
  bytes32 internal immutable CBETH_PRICE_ID;

  struct Config {
    address pyth;
    bytes32 nativePriceId;
    TokenConfig dai;
    TokenConfig usdc;
    TokenConfig weth;
    TokenConfig reth;
    TokenConfig cbeth;
  }

  struct TokenConfig {
    address token;
    bytes32 priceId;
  }

  constructor(Config memory c) PriceOracle(c.pyth) {
    NATIVE_PRICE_ID = c.nativePriceId;
    DAI = c.dai.token;
    DAI_PRICE_ID = c.dai.priceId;
    USDC = c.usdc.token;
    USDC_PRICE_ID = c.usdc.priceId;
    WETH = c.weth.token;
    WETH_PRICE_ID = c.weth.priceId;
    RETH = c.reth.token;
    RETH_PRICE_ID = c.reth.priceId;
    CBETH = c.cbeth.token;
    CBETH_PRICE_ID = c.cbeth.priceId;
  }

  function _priceId(address token) internal view override returns (bytes32 priceId) {
    if (token == NATIVE) return NATIVE_PRICE_ID;
    if (token == DAI) return DAI_PRICE_ID;
    if (token == USDC) return USDC_PRICE_ID;
    if (token == WETH) return WETH_PRICE_ID;
    if (token == RETH) return RETH_PRICE_ID;
    if (token == CBETH) return CBETH_PRICE_ID;
    revert UnsupportedToken(token);
  }

  function _decimals(address token) internal view override returns (uint8 decimals) {
    if (token == NATIVE) return NATIVE_DECIMALS;
    if (token == DAI) return DAI_DECIMALS;
    if (token == USDC) return USDC_DECIMALS;
    if (token == WETH) return WETH_DECIMALS;
    if (token == RETH) return RETH_DECIMALS;
    if (token == CBETH) return CBETH_DECIMALS;
    revert UnsupportedToken(token);
  }
}
