import { Field } from '@nestjs/graphql';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  IsOptional,
} from 'class-validator';
import { isAddress } from 'lib';

export const IsAddress =
  (validationOptions?: ValidationOptions) =>
  // Object is a required parameter type for PropertyDecorator
  // eslint-disable-next-line @typescript-eslint/ban-types
  (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'isAddress',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          return typeof value === 'string' && isAddress(value);
        },
      },
    });
  };

export type AddressFieldOptions = ValidationOptions & {
  optional?: boolean;
};

export const AddressField =
  ({
    optional,
    ...validationOpts
  }: AddressFieldOptions = {}): PropertyDecorator =>
  (target, propertyKey) => {
    Field(() => String, { nullable: optional })(target, propertyKey);

    if (optional) IsOptional(validationOpts)(target, propertyKey);
    IsAddress(validationOpts)(target, propertyKey as string);
  };
