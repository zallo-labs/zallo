import { FieldMiddleware } from '@nestjs/graphql';
import { ethers } from 'ethers';
import { address } from 'lib';

export const AddressMiddleware: FieldMiddleware = async (ctx, next) => {
  const value = await next();

  // An address with an invalid checksum will fail this check
  if (typeof value === 'string' && ethers.utils.isAddress(value))
    return address(value);

  return value;
};
