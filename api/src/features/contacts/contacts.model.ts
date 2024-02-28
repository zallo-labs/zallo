import { Field } from '@nestjs/graphql';
import { UAddressField } from '~/apollo/scalars/UAddress.scalar';
import * as eql from '~/edgeql-interfaces';
import { UAddress } from 'lib';
import { Node, NodeType } from '~/decorators/interface.decorator';

@NodeType()
export class Contact extends Node implements Partial<eql.Contact> {
  @UAddressField()
  address: UAddress;

  @Field(() => String)
  label: string;
}
