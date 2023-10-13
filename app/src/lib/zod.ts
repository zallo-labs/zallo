import { Hex, isAddress, isHex } from 'lib';
import { RefinementCtx, ZodTypeAny, z } from 'zod';

export const zAddress = z
  .string()
  .refine(isAddress, (val) => ({ message: `${val} must be a Address` }));

export const zHash = z.string().refine((arg): arg is Hex => isHex(arg, 32));

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

export const zArray = <T extends ZodTypeAny>(schema: T) =>
  z.preprocess(
    (arg) => (Array.isArray(arg) ? arg : typeof arg === 'string' ? arg.split(',') : [arg]),
    z.array(schema),
  );
