import { Args, ArgsOptions } from '@nestjs/graphql';

export const Input =
  (opts: ArgsOptions = {}): ParameterDecorator =>
  (target, propertyKey, parameterIndex) => {
    Args('input', opts)(target, propertyKey, parameterIndex);
  };
