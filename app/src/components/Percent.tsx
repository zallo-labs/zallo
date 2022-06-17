import { FormattedNumber, Numberish } from './FormattedNumber';

const appendSign = (v: string) => `${v}%`;

export interface PercentProps {
  children: Numberish;
  sign?: boolean;
}

export const Percent = ({ children, sign }: PercentProps) => (
  <FormattedNumber
    value={children}
    minimumFractionDigits={0}
    maximumFractionDigits={2}
    postFormat={sign ? appendSign : undefined}
  />
);
