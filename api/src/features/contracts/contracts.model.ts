import { ObjectType } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { ContractFunction } from '../contract-functions/contract-functions.model';

@ObjectType()
export class Contract {
  @AddressField()
  id: string; // Address

  functions?: ContractFunction[];
}
