import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum ProposableStatus {
  active,
  add,
  remove,
}
registerEnumType(ProposableStatus, {
  name: 'ProposableStatus',
});

@ObjectType()
export class ProposableState {
  @Field(() => ProposableStatus)
  status: ProposableStatus;

  proposedModificationHash?: string;
}
