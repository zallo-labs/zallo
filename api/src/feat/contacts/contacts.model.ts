import { Field, InterfaceType } from '@nestjs/graphql';
import { UAddressField } from '~/common/scalars/UAddress.scalar';
import * as eql from '~/edgeql-interfaces';
import { UAddress } from 'lib';
import { Node, NodeType } from '~/common/decorators/interface.decorator';

@InterfaceType()
export class Labelled {
  @Field(() => String)
  name: string;
}

@NodeType({ implements: Labelled })
export class Contact extends Node implements Partial<eql.Contact> {
  @UAddressField()
  address: UAddress;

  @Field(() => String)
  name: string;
}
