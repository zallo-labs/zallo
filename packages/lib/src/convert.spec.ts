import { parseUnits } from 'viem';
import { tokenToToken, fiatToToken, tokenToFiat } from './convert';

const USDC_DECIMALS = 6;
const ETH_DECIMALS = 18;
const ETH_PRICE = 2150;

describe('convert', () => {
  it('token to token', () => {
    const fiveUsdc = parseUnits('5', USDC_DECIMALS);

    expect(
      tokenToToken(
        tokenToToken(fiveUsdc, USDC_DECIMALS, ETH_DECIMALS),
        ETH_DECIMALS,
        USDC_DECIMALS,
      ),
    ).toEqual(fiveUsdc);
  });

  it('fiat to token', () => {
    expect(fiatToToken(645, ETH_PRICE, ETH_DECIMALS)).toEqual(parseUnits('0.3', ETH_DECIMALS));
  });

  it('token to fiat', () => {
    expect(tokenToFiat(parseUnits('0.3', ETH_DECIMALS), ETH_PRICE, ETH_DECIMALS)).toEqual(645);
  });
});
