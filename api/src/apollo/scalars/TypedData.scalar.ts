import { UserInputError } from '@nestjs/apollo';
import { TypedDataDefinition, validateTypedData } from 'viem';

import { createScalar } from './util';

const description = 'EIP712 Typed Data';

export const [TypedDataScalar, TypedDataField] = createScalar<TypedDataDefinition, any>({
  name: 'TypedData',
  description,
  serialize: (value) => value as TypedDataDefinition,
  parseValue: (value: any): TypedDataDefinition => {
    try {
      validateTypedData(value as any);
      return value as TypedDataDefinition;
    } catch (e) {
      throw new UserInputError(`Provided value is not a ${description}: ${(e as Error)?.message}`);
    }
  },
  extensions: {
    codegenScalarType: 'viem#TypedDataDefinition',
  },
});
