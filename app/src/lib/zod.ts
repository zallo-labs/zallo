import { CHAINS, Chain } from 'chains';
import { Hex, isHex, tryAsAddress, tryAsUAddress } from 'lib';
import { RefinementCtx, ZodTypeAny, z } from 'zod';

export const zAddress = z.string().transform((v, ctx) => {
  const address = tryAsAddress(v);
  if (!address) {
    ctx.addIssue({ code: 'custom', message: 'Not an address' });
    return z.NEVER;
  }
  return address;
});

export const zUAddress = z.string().transform((v, ctx) => {
  const address = tryAsUAddress(v);
  if (!address) {
    ctx.addIssue({ code: 'custom', message: 'Not a unique address' });
    return z.NEVER;
  }
  return address;
});

export const zHash = z.string().refine((arg): arg is Hex => isHex(arg, 32));

export const zChain = z.enum(
  Object.values(CHAINS).map((c) => c.key) as unknown as [Chain, ...Chain[]],
);

export const parseAsObject =
  <R>() =>
  (arg: string, ctx: RefinementCtx): R => {
    try {
      return JSON.parse(arg) as R;
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid TypedDataDefinition' });
      return z.NEVER;
    }
  };

export const zArray = <T extends ZodTypeAny, R extends ZodTypeAny = z.ZodArray<T>>(
  schema: T,
  refine?: (arr: z.ZodArray<T>) => R,
) =>
  z.preprocess(
    (arg) => (Array.isArray(arg) ? arg : typeof arg === 'string' ? arg.split(',') : [arg]),
    refine ? refine(z.array(schema)) : z.array(schema),
  );
