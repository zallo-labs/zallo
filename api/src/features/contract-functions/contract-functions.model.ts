import { Field, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { SelectorField } from '~/apollo/scalars/Bytes.scalar';
import { Node, NodeType } from '~/decorators/interface.decorator';
import * as eql from '~/edgeql-interfaces';

@NodeType()
export class ContractFunction extends Node implements eql.Function {
  @SelectorField()
  selector: string; // Selector

  @Field(() => GraphQLJSON)
  abi: any; // TODO: type as AbiFunction

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
