import { Field, ObjectType } from '@nestjs/graphql';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { IdField } from '~/apollo/scalars/Id.scalar';
import * as eql from '~/edgeql-interfaces';

@ObjectType()
export class Approver implements Partial<eql.Approver> {
  @IdField()
  id: uuid;

  @AddressField()
  address: Address;

  @Field(() => String, { nullable: true })
  label?: string;
}

@ObjectType()
export class UserApprover extends Approver implements Partial<eql.Approver> {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  pushToken?: string;
}
