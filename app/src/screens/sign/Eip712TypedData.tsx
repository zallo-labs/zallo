import { useMemo } from 'react';
import { Eip712TypedDomainData } from '~/util/walletconnect/methods/signing';
import { TypedDataComponent } from '~/components/TypedData/TypedDataObject';
import { TypedData } from '~/components/TypedData/TypedData';
import { TypedDataField } from 'ethers';
import assert from 'assert';

const fieldToComponent = (
  name: string,
  value: unknown,
  type: string | undefined,
  types: Record<string, TypedDataField[]>,
): TypedDataComponent => {
  const isObj = typeof value === 'object' && type && types[type] !== undefined;
  if (!isObj) return { name, type, value };

  return {
    name,
    type,
    components: Object.entries(value as Record<string, unknown>).map(([fieldName, fieldValue]) => {
      const fieldType = types[type].find((f) => f.name === fieldName)?.type;
      assert(fieldType);

      return fieldToComponent(fieldName, fieldValue, fieldType, types);
    }),
  };
};

export interface Eip712TypedDataProps {
  data: string | Eip712TypedDomainData;
}

export const Eip712TypedData = ({ data }: Eip712TypedDataProps) => {
  const typedData = useMemo((): TypedDataComponent => {
    if (typeof data === 'string') return { value: data };

    return {
      type: data.primaryType,
      components: Object.entries(data.message).map(([fieldName, fieldValue]) => {
        const fieldType = data.types[data.primaryType].find((f) => f.name === fieldName)?.type;
        assert(fieldType);

        return fieldToComponent(fieldName, fieldValue, fieldType, data.types);
      }),
    };
  }, [data]);

  return <TypedData data={typedData} />;
};
