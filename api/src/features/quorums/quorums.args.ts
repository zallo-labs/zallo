import { SpendingFallback } from '@gen/prisma/spending-fallback.enum';
import { FindManyQuorumArgs } from '@gen/quorum/find-many-quorum.args';
import { ArgsType, Field, InputType, registerEnumType } from '@nestjs/graphql';
import { BigNumber } from 'ethers';
import { Address, Quorum, QuorumKey, TokenLimitPeriod } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { BigNumberField } from '~/apollo/scalars/BigNumber.scalar';
import { QuorumKeyField } from '~/apollo/scalars/QuorumKey.sclar';
import { SetField } from '~/apollo/scalars/SetField';

@ArgsType()
export class UniqueQuorumArgs {
  @AddressField()
  account: Address;

  @QuorumKeyField()
  key: QuorumKey;
}

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
export class UpdateQuorumArgs extends UniqueQuorumArgs {
  @QuorumKeyField({ nullable: true, description: 'Defaults to the `key`' })
  proposingQuorumKey?: QuorumKey;

  @SetField(() => AddressScalar, { min: 1 })
  approvers: Set<Address>;

  spending?: SpendingInput;
}

@ArgsType()
export class RemoveQuorumArgs extends UniqueQuorumArgs {
  @QuorumKeyField({ nullable: true, description: 'Defaults to the `key`' })
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
}

@ArgsType()
export class UpdateQuorumMetadataArgs extends UniqueQuorumArgs {
  name: string;
}
