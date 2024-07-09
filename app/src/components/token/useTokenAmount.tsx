import Decimal from 'decimal.js';
import { FormattedNumberOptions, useFormattedNumber } from '../format/FormattedNumber';
import { Decimallike } from 'lib';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import {
  useTokenAmount_token$data,
  useTokenAmount_token$key,
} from '~/api/__generated__/useTokenAmount_token.graphql';

const Token = graphql`
  fragment useTokenAmount_token on Token {
    name
    symbol
    decimals
    units {
      symbol
      decimals
    }
  }
`;

const unknownToken = {
  name: '???',
  symbol: '???',
  decimals: 0,
  units: [],
  ' $fragmentType': 'useTokenAmount_token',
} satisfies useTokenAmount_token$data;

export interface TokenAmountOptions extends Partial<FormattedNumberOptions> {
  token: useTokenAmount_token$key | null | undefined;
  amount: Decimallike | undefined;
}

export const useTokenAmount = ({
  token: tokenFragment,
  amount: amountProp,
  ...options
}: TokenAmountOptions) => {
  const amount = amountProp ? new Decimal(amountProp) : new Decimal('0');

  const token = useFragment(Token, tokenFragment) ?? unknownToken;

  const d = token.decimals - (amount.toFixed().match(/\.(0*)/)?.[1]?.length ?? 0);
  const units = [token, ...(token.units ?? [])].sort((a, b) => b.decimals - a.decimals /* desc */);
  const unit = amount.eq(0)
    ? token
    : units.reduce(
        // Find the closest unit; bias the smaller unit (-1)
        (closest, unit) =>
          Math.abs(unit.decimals - d) - 1 <= Math.abs(closest.decimals - d) ? unit : closest,
        units[0],
      );

  const unitAmount = amount.mul(new Decimal(10).pow(token.decimals - unit.decimals));

  return useFormattedNumber({
    value: unitAmount,
    maximumFractionDigits: 3,
    minimumNumberFractionDigits: 5,
    postFormat: (v) => `${v} ${unit.symbol}`,
    ...options,
  });
};
