import { Address, isAddress } from 'lib';
import { AddrIcon, AddrIconProps } from './AddrIcon';
import { LabelIcon, LabelIconProps } from './LabelIcon';

export type AddrOrLabelIconProps = Omit<AddrIconProps, 'addr'> &
  LabelIconProps & {
    label: string | Address;
  };

export const AddrOrLabelIcon = ({ label, ...props }: AddrOrLabelIconProps) =>
  isAddress(label) ? <AddrIcon addr={label} {...props} /> : <LabelIcon label={label} {...props} />;
