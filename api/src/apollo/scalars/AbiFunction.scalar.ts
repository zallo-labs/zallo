import { GraphQLJSON } from 'graphql-scalars';
import { createScalar } from '~/apollo/scalars/util';

export const [AbiFunctionScalar, AbiFunctionField] = createScalar({
  name: 'AbiFunction',
  serialize: GraphQLJSON.serialize,
  parseValue: GraphQLJSON.parseValue,
  parseLiteral: GraphQLJSON.parseLiteral,
  specifiedByURL: 'https://docs.soliditylang.org/en/latest/abi-spec.html#json',
  extensions: {
    codegenScalarType: 'abitype#AbiFunction',
  },
});
