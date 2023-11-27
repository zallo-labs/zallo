import { useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import { useMemo } from 'react';
import { ZodType, ZodTypeDef } from 'zod';

export function useLocalParams<
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(schema: ZodType<Output, Def, Input>) {
  const params = useLocalSearchParams();

  return useMemo(() => {
    const decodedParams = _.mapValues(params, (v) =>
      typeof v === 'string' ? decodeURIComponent(v) : v,
    );

    return schema.parse(decodedParams);
  }, [params, schema]);
}

// type Param = ReturnType<typeof useLocalSearchParams>[string];
// function decodeParam(v: Param) {
//   // Fix array query parameters 'a,b,c' -> ['a', 'b', 'c']
//   if (typeof v === 'string' && v.includes(',')) v = v.split(',');

//   if (typeof v !== 'string') return v;

//   v = decodeURIComponent(v);
// }
