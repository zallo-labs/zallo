import { Args } from '@nestjs/graphql';

export const Input = (): ParameterDecorator => (target, propertyKey, parameterIndex) => {
  Args('input')(target, propertyKey, parameterIndex);
};
