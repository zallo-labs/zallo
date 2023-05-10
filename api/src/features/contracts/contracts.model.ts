import { ObjectType } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { ContractFunction } from '../contract-functions/contract-functions.model';
import { IdField } from '~/apollo/scalars/Id.scalar';
import * as eql from '~/edgeql-interfaces';

@ObjectType()
export class Contract implements eql.Contract {
  @IdField()
  id: string;

  @AddressField()
  address: string; // Address

  functions: ContractFunction[];
}
