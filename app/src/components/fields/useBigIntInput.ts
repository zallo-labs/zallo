import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useNumberInput } from './useNumberInput';

export interface BigIntInputOptions {
  value: bigint | undefined;
  onChange: (value: bigint) => void;
  decimals: number | undefined;
}

export const useBigIntInput = ({ value, onChange, decimals }: BigIntInputOptions) =>
  useNumberInput({
    value: value !== undefined ? parseFloat(formatUnits(value, decimals ?? 0)) : undefined,
    onChange: (value) => onChange(parseUnits(value.toString(), decimals ?? 0).toBigInt()),
    maxDecimals: decimals,
  });
