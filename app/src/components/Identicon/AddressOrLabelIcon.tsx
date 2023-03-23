import { Address, isAddress } from 'lib';
import { AddressIcon, AddressIconProps } from './AddressIcon';
import { LabelIcon, LabelIconProps } from './LabelIcon';

export type AddressOrLabelIconProps = Omit<AddressIconProps, 'addr'> &
  LabelIconProps & {
    label: string | Address;
  };

export const AddressOrLabelIcon = ({ label, ...props }: AddressOrLabelIconProps) =>
  isAddress(label) ? (
    <AddressIcon addr={label} {...props} />
  ) : (
    <LabelIcon label={label} {...props} />
  );
