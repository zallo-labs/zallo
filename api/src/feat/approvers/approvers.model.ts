import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLMAC } from 'graphql-scalars';
import { Address } from 'lib';
import { AddressField } from '~/common/scalars/Address.scalar';
import { NodeType, Node } from '~/common/decorators/interface.decorator';
import * as eql from '~/edgeql-interfaces';

@NodeType()
export class Approver extends Node implements Partial<eql.Approver> {
  @AddressField()
  address: Address;

  @Field(() => String, { nullable: true })
  label?: string;
}

export enum CloudProvider {
  Apple = 'Apple',
  Google = 'Google',
}
registerEnumType(CloudProvider, { name: 'CloudProvider' });

@ObjectType()
export class Cloud {
  @Field(() => CloudProvider)
  provider: CloudProvider;

  @Field(() => String)
  subject: string;
}

@NodeType()
export class UserApprover extends Approver {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  pushToken?: string;

  @Field(() => [GraphQLMAC], { nullable: true })
  bluetoothDevices?: string[];

  @Field(() => Cloud, { nullable: true })
  cloud?: Cloud;
}
