import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { GraphQLJSON } from 'graphql-scalars';
import { SelectorField } from '~/apollo/scalars/Bytes.scalar';
import { IdField } from '~/apollo/scalars/Id.scalar';
import * as eql from '~/edgeql-interfaces';

@ObjectType()
export class ContractFunction implements eql.Function {
  @IdField()
  id: uuid;

  @SelectorField()
  selector: string; // Selector

  @Field(() => GraphQLJSON)
  abi: any;

  @Field(() => String)
  abiMd5: string;

  @Field(() => AbiSource)
  source: keyof typeof AbiSource;
}

export enum AbiSource {
  Verified = 'Verified',
}
registerEnumType(AbiSource, { name: 'AbiSource' });

export enum AbiSourceConfidence {
  Low,
  Medium,
  High,
}
registerEnumType(AbiSourceConfidence, { name: 'AbiSourceConfidence' });
