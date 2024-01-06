import { UserInputError } from '@nestjs/apollo';
import { AbiFunction } from 'abitype';
import { AbiFunction as AbiFunctionSchema } from 'abitype/zod';
import { GraphQLJSON } from 'graphql-scalars';

import { createScalar } from '~/apollo/scalars/util';

function parseValue(v: unknown): AbiFunction {
  const r = AbiFunctionSchema.safeParse(v);
  if (!r.success)
    throw new UserInputError(`Provided value is not a valid AbiFunction: ${r.error.toString()}`);
  return r.data;
}

export const [AbiFunctionScalar, AbiFunctionField] = createScalar({
  name: 'AbiFunction',
  serialize: GraphQLJSON.serialize,
  parseValue,
  parseLiteral: (ast) => parseValue(GraphQLJSON.parseLiteral(ast)),
  specifiedByURL: 'https://docs.soliditylang.org/en/latest/abi-spec.html#json',
  extensions: {
    codegenScalarType: 'abitype#AbiFunction',
  },
});
