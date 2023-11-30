import { FieldMiddleware } from '@nestjs/graphql';
import { tryAsAddress, tryAsUAddress } from 'lib';

export const AddressMiddleware: FieldMiddleware = async (ctx, next) => {
  const value = await next();

  // This will checksum any addresses
  return tryAsAddress(value) ?? tryAsUAddress(value) ?? value;
};
