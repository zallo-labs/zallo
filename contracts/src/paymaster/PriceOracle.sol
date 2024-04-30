// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.20;

import {IPyth} from '@pythnetwork/pyth-sdk-solidity/IPyth.sol';
import {PythStructs} from '@pythnetwork/pyth-sdk-solidity/PythStructs.sol';

struct TokenConfig {
  address token;
  bytes32 usdPriceId;
}

struct PriceOracleConfig {
  address pyth;
  bytes32 ethUsdPriceId;
  TokenConfig dai;
  TokenConfig usdc;
  TokenConfig weth;
  TokenConfig reth;
  TokenConfig cbeth;
}

abstract contract PriceOracle {
  error UnsupportedToken(address token);
  error InvalidTokenPrice(PythStructs.Price price);

  uint256 private constant PRICE_DECIMALS = 18;
  IPyth internal immutable PYTH;

  address internal immutable ETH = address(0);
  uint256 internal immutable ETH_DECIMALS = 18;
  bytes32 internal immutable ETH_USD_PRICE_ID;
  address internal immutable DAI;
  uint256 internal immutable DAI_DECIMALS = 18;
  bytes32 internal immutable DAI_USD_PRICE_ID;
  address internal immutable USDC;
  uint256 internal immutable USDC_DECIMALS = 6;
  bytes32 internal immutable USDC_USD_PRICE_ID;
  address internal immutable WETH;
  uint256 internal immutable WETH_DECIMALS = 18;
  bytes32 internal immutable WETH_USD_PRICE_ID;
  address internal immutable RETH;
  uint256 internal immutable RETH_DECIMALS = 18;
  bytes32 internal immutable RETH_USD_PRICE_ID;
  address internal immutable CBETH;
  uint256 internal immutable CBETH_DECIMALS = 18;
  bytes32 internal immutable CBETH_USD_PRICE_ID;

  constructor(PriceOracleConfig memory p) {
    PYTH = IPyth(p.pyth);
    ETH_USD_PRICE_ID = p.ethUsdPriceId;
    DAI = p.dai.token;
    DAI_USD_PRICE_ID = p.dai.usdPriceId;
    USDC = p.usdc.token;
    USDC_USD_PRICE_ID = p.usdc.usdPriceId;
    WETH = p.weth.token;
    WETH_USD_PRICE_ID = p.weth.usdPriceId;
    RETH = p.reth.token;
    RETH_USD_PRICE_ID = p.reth.usdPriceId;
    CBETH = p.cbeth.token;
    CBETH_USD_PRICE_ID = p.cbeth.usdPriceId;
  }

  function _convert(
    uint256 amount,
    address fromToken,
    address toToken
  ) internal view returns (uint256 converted) {
    if (fromToken == toToken) return amount;

    uint256 normalizedAmount = _normalize(amount, _decimals(fromToken), _decimals(toToken));
    return (normalizedAmount * _usd(fromToken)) / _usd(toToken);
  }

  function _usd(address token) private view returns (uint256 usd) {
    if (token == ETH) return _price(ETH_USD_PRICE_ID);
    if (token == DAI) return _price(DAI_USD_PRICE_ID);
    if (token == USDC) return _price(USDC_USD_PRICE_ID);
    if (token == WETH) return _price(WETH_USD_PRICE_ID);
    if (token == RETH) return _price(RETH_USD_PRICE_ID);
    if (token == CBETH) return _price(CBETH_USD_PRICE_ID);
    revert UnsupportedToken(token);
  }

  function _price(bytes32 priceId) private view returns (uint256 normalizedPrice) {
    PythStructs.Price memory price = PYTH.getPriceNoOlderThan(priceId, 60 minutes);

    if (price.price <= 0 || price.expo > 0 || price.expo < -255) revert InvalidTokenPrice(price);

    return _normalize(uint256(uint64(price.price)), uint32(-1 * price.expo), PRICE_DECIMALS);
  }

  function _normalize(
    uint256 amount,
    uint256 currentDecimals,
    uint256 newDecimals
  ) private pure returns (uint256 normalized) {
    if (newDecimals >= currentDecimals) {
      return amount * 10 ** (newDecimals - currentDecimals);
    } else {
      return amount / 10 ** (currentDecimals - newDecimals);
    }
  }

  function _decimals(address token) private view returns (uint256 decimals) {
    if (token == ETH) return ETH_DECIMALS;
    if (token == DAI) return DAI_DECIMALS;
    if (token == USDC) return USDC_DECIMALS;
    if (token == WETH) return WETH_DECIMALS;
    if (token == RETH) return RETH_DECIMALS;
    if (token == CBETH) return CBETH_DECIMALS;
    revert UnsupportedToken(token);
  }
}
