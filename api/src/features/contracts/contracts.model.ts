import { Field, ObjectType } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { ContractFunction } from '../contract-functions/contract-functions.model';
import { IdField } from '~/apollo/scalars/Id.scalar';
import * as eql from '~/edgeql-interfaces';
import { uuid } from 'edgedb/dist/codecs/ifaces';

@ObjectType()
export class Contract implements eql.Contract {
  @IdField()
  id: uuid;

  @AddressField()
  address: string; // Address

  @Field(() => [ContractFunction])
  functions: ContractFunction[];
}
