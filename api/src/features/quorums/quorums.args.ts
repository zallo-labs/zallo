import { SpendingFallback } from '@gen/prisma/spending-fallback.enum';
import { FindManyQuorumArgs } from '@gen/quorum/find-many-quorum.args';
import { ArgsType, Field, InputType, registerEnumType } from '@nestjs/graphql';
import { BigNumber } from 'ethers';
import { Address, Quorum, QuorumKey, TokenLimitPeriod } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { BigNumberField, QuorumKeyField } from '~/apollo/scalars/BigNumber.scalar';
import { SetField } from '~/apollo/scalars/SetField';

@InputType()
export class QuorumGuidInput {
  @AddressField()
  account: Address;

  @QuorumKeyField()
  key: QuorumKey;
}

@ArgsType()
export class UniqueQuorumArgs extends QuorumGuidInput {}

@ArgsType()
export class QuorumsArgs extends FindManyQuorumArgs {}

registerEnumType(TokenLimitPeriod, { name: 'TokenLimitPeriod' });

@InputType()
export class TokenLimitInput {
  @AddressField()
  token: Address;

  @BigNumberField()
  amount: BigNumber;

  @Field(() => TokenLimitPeriod)
  period: TokenLimitPeriod;
}

@InputType()
export class SpendingInput {
  @Field(() => [TokenLimitInput], { nullable: true, defaultValue: [] })
  limits: TokenLimitInput[];

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  fallback: SpendingFallback;
}

@ArgsType()
export class CreateQuorumArgs {
  @AddressField()
  account: Address;

  @QuorumKeyField()
  proposingQuorumKey: QuorumKey;

  @SetField(() => AddressScalar, { min: 1 })
  approvers: Set<Address>;

  name: string;

  spending?: SpendingInput;
}

@ArgsType()
export class UpdateQuorumArgs extends QuorumGuidInput {
  // Defaults to the `key`
  @QuorumKeyField({ nullable: true })
  proposingQuorumKey?: QuorumKey;

  @SetField(() => AddressScalar, { min: 1 })
  approvers: Set<Address>;

  spending?: SpendingInput;
}

@ArgsType()
export class RemoveQuorumArgs extends QuorumGuidInput {
  // Defaults to the `key`
  @QuorumKeyField({ nullable: true })
  proposingQuorumKey?: QuorumKey;
}

@InputType()
export class QuorumInput {
  name: string;

  @SetField(() => AddressScalar, { min: 1 })
  approvers: Set<Address>;

  spending?: SpendingInput;

  static toQuorum(q: QuorumInput, key: QuorumKey): Quorum {
    return {
      key,
      approvers: q.approvers,
      spending: q.spending
        ? {
            fallback: q.spending.fallback,
            limit: Object.fromEntries(
              (q.spending.limits ?? []).map((limit) => [limit.token, limit] as const),
            ),
          }
        : undefined,
    };
  }

  toQuorum(key: QuorumKey) {
    return QuorumInput.toQuorum(this, key);
  }
}

@ArgsType()
export class UpdateQuorumMetadataArgs extends QuorumGuidInput {
  name: string;
}
