// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

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
  error InvalidTokenPrice(PythStructs.Price price);

  int32 internal constant NORMALIZED_DECIMALS = 18;
  address constant ETH = address(0);

  IPyth internal immutable PYTH;
  bytes32 internal immutable ETH_USD_PRICE_ID;
  address internal immutable DAI;
  bytes32 internal immutable DAI_USD_PRICE_ID;
  address internal immutable USDC;
  bytes32 internal immutable USDC_USD_PRICE_ID;
  address internal immutable WETH;
  bytes32 internal immutable WETH_USD_PRICE_ID;
  address internal immutable RETH;
  bytes32 internal immutable RETH_USD_PRICE_ID;
  address internal immutable CBETH;
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

  function _tokenPerEth(address token) internal view returns (uint256 perEth) {
    if (token == ETH) return 1;

    uint256 ethUSD = _price(ETH_USD_PRICE_ID);
    if (token == DAI) return _price(DAI_USD_PRICE_ID) / ethUSD;
    if (token == USDC) return _price(USDC_USD_PRICE_ID) / ethUSD;
    if (token == WETH) return _price(WETH_USD_PRICE_ID) / ethUSD;
    if (token == RETH) return _price(RETH_USD_PRICE_ID) / ethUSD;
    if (token == CBETH) return _price(CBETH_USD_PRICE_ID) / ethUSD;
  }

  function _price(bytes32 priceId) private view returns (uint256 normalizedPrice) {
    PythStructs.Price memory price = PYTH.getPriceNoOlderThan(priceId, 60 minutes);

    if (price.price < 0 || price.expo > 0 || price.expo < -255) revert InvalidTokenPrice(price);

    // Normalize
    int32 priceDecimals = -1 * price.expo;
    if (NORMALIZED_DECIMALS >= priceDecimals) {
      return uint256(uint64(price.price)) * 10 ** uint32(NORMALIZED_DECIMALS - priceDecimals);
    } else {
      return uint256(uint64(price.price)) / 10 ** uint32(priceDecimals - NORMALIZED_DECIMALS);
    }
  }
}
