import { FieldMiddleware } from '@nestjs/graphql';
import { asAddress, isAddressLike } from 'lib';

export const AddressMiddleware: FieldMiddleware = async (ctx, next) => {
  const value = await next();

  // An address with an invalid checksum will fail this check
  if (isAddressLike(value)) return asAddress(value);

  return value;
};
