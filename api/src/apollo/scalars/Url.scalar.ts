import { Kind } from 'graphql';
import { createScalar } from './util';
import { UserInputError } from '@nestjs/apollo';

function parseValue(v: unknown) {
  if (typeof v !== 'string') throw new UserInputError('URL must be a string');
  try {
    return new URL(v).toString();
  } catch (e) {
    throw new UserInputError(`Invalid URL: ${(e as Error).message}`);
  }
}

export const [UrlScalar, UrlField] = createScalar<string, string>({
  name: 'URL',
  description: 'A field whose value conforms to the standard URL format as specified in RFC3986',
  serialize: (v) => v,
  parseValue,
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING) throw new UserInputError('URL must be a string');
    return parseValue(ast.value);
  },
  specifiedByURL: 'https://www.ietf.org/rfc/rfc3986.txt',
  extensions: {
    codegenScalarType: 'URL | string',
    jsonSchema: {
      type: 'string',
      format: 'uri',
    },
  },
});
