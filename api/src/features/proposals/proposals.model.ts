import { Approval } from '@gen/approval/approval.model';
import { ObjectType, OmitType } from '@nestjs/graphql';
import { PolicyKey } from 'lib';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';

@ObjectType()
export class Rejection extends OmitType(Approval, ['signature'] as const) {}

@ObjectType()
export class SatisfiablePolicy {
  id: string;

  @PolicyKeyField()
  key: PolicyKey;

  satisfied: boolean;
}
