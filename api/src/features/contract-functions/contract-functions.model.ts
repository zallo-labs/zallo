import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { Contract } from '../contracts/contracts.model';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { SelectorField } from '~/apollo/scalars/Bytes.scalar';

@ObjectType()
export class ContractFunction {
  id: number;

  contract?: Contract | null;

  @AddressField({ nullable: true })
  contractId: string | null; // Address | null

  @SelectorField()
  selector: string; // Selector

  @Field(() => GraphQLJSON)
  abi: any;

  @Field(() => AbiSource)
  source: keyof typeof AbiSource;
}

export enum AbiSource {
  VERIFIED = 'VERIFIED',
  STANDARD = 'STANDARD',
  DECOMPILED = 'DECOMPILED',
}
registerEnumType(AbiSource, { name: 'AbiSource' });

export enum ContractSourceConfidence {
  Low,
  Medium,
  High,
}
registerEnumType(ContractSourceConfidence, { name: 'ContractSourceConfidence' });
