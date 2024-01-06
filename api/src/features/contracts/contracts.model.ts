import { Field, ObjectType } from '@nestjs/graphql';
import { uuid } from 'edgedb/dist/codecs/ifaces';

import { AddressField } from '~/apollo/scalars/Address.scalar';
import { IdField } from '~/apollo/scalars/Id.scalar';
import * as eql from '~/edgeql-interfaces';
import { ContractFunction } from '../contract-functions/contract-functions.model';

@ObjectType()
export class Contract implements eql.Contract {
  @IdField()
  id: uuid;

  @AddressField()
  address: string; // Address

  @Field(() => [ContractFunction])
  functions: ContractFunction[];
}
