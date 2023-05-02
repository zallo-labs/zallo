import { Field, ObjectType } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { User } from '../users/users.model';

@ObjectType()
export class Contact {
  // @Field(() => User, { nullable: false })
  // user?: User;

  // @AddressField()
  // userId: string; // Address

  @AddressField()
  addr: string; // Address

  name: string;
}
