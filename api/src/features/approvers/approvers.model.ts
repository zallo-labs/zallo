import { Field, ObjectType } from '@nestjs/graphql';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { GraphQLMAC } from 'graphql-scalars';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { NodeType, Node } from '~/decorators/interface.decorator';
import * as eql from '~/edgeql-interfaces';

@NodeType()
export class Approver extends Node implements Partial<eql.Approver> {
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

  @Field(() => [GraphQLMAC])
  bluetoothDevices: string[];
}
