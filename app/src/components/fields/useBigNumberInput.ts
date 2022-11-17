import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useNumberInput } from './useNumberInput';

export interface UseBigNumberInputOptions {
  value: BigNumber | undefined;
  onChange: (value: BigNumber) => void;
  decimals: number | undefined;
}

export const useBigNumberInput = ({ value, onChange, decimals }: UseBigNumberInputOptions) =>
  useNumberInput({
    value: value && parseFloat(formatUnits(value, decimals ?? 0)),
    onChange: (value) => onChange(parseUnits(value.toString(), decimals ?? 0)),
    maxDecimals: decimals,
  });
