import { HrefObject, useLocalSearchParams } from 'expo-router';
import { ZodType, ZodTypeDef } from 'zod';

type AllRoute<Pathname extends string = `/`> = HrefObject<{ pathname: Pathname }>['pathname'];

export function useLocalParams<
  Pathname extends AllRoute,
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(pathname: Pathname, schema: ZodType<Output, Def, Input>) {
  const params = useLocalSearchParams();
  return schema.parse(params);
}
