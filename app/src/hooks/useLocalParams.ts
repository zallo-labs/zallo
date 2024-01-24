import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ZodType, ZodTypeDef } from 'zod';

export function useLocalParams<
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(schema: ZodType<Output, Def, Input>) {
  const params = useLocalSearchParams();

  return useMemo(() => schema.parse(params), [params, schema]);
}
