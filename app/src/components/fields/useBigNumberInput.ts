import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useNumberInput } from './useNumberInput';

export interface UseBigNumberInputOptions {
  value?: BigNumber;
  onChange: (value: BigNumber) => void;
  decimals?: number;
}

export const useBigNumberInput = ({
  value,
  onChange,
  decimals = 0,
}: UseBigNumberInputOptions) =>
  useNumberInput({
    value: value && parseFloat(formatUnits(value, decimals)),
    onChange: (value) => onChange(parseUnits(value.toString(), decimals)),
  });
