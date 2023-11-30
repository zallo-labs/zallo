import { CHAINS, Chain } from 'chains';
import { Hex, isHex, tryAsAddress, tryAsUAddress, TryAsAddressParams } from 'lib';
import { ZodTypeAny, z } from 'zod';

export interface ZAddressParams extends TryAsAddressParams {}

export function zAddress(params?: ZAddressParams) {
  return z.string().transform((v, ctx) => {
    const address = tryAsAddress(v, params);
    if (!address) {
      ctx.addIssue({ code: 'custom', message: 'Not an address' });
      return z.NEVER;
    }
    return address;
  });
}

export function zUAddress() {
  return z.string().transform((v, ctx) => {
    const address = tryAsUAddress(v);
    if (!address) {
      ctx.addIssue({ code: 'custom', message: 'Not a unique address' });
      return z.NEVER;
    }
    return address;
  });
}

export function zHash() {
  return z.string().refine((arg): arg is Hex => isHex(arg, 32));
}

export function zChain() {
  return z.enum(Object.values(CHAINS).map((c) => c.key) as unknown as [Chain, ...Chain[]]);
}

export function zArray<T extends ZodTypeAny, R extends ZodTypeAny = z.ZodArray<T>>(
  schema: T,
  withArray?: (array: z.ZodArray<T>) => R,
) {
  return z.preprocess(
    (arg) => (Array.isArray(arg) ? arg : typeof arg === 'string' ? arg.split(',') : [arg]),
    withArray ? withArray(z.array(schema)) : z.array(schema),
  );
}
