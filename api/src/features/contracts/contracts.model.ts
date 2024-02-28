import { Field } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { ContractFunction } from '../contract-functions/contract-functions.model';
import * as eql from '~/edgeql-interfaces';
import { Node, NodeType } from '~/decorators/interface.decorator';

@NodeType()
export class Contract extends Node implements eql.Contract {
  @AddressField()
  address: string; // Address

  @Field(() => [ContractFunction])
  functions: ContractFunction[];
}
