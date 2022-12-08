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
export class SpendingConfigInput {
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  allowlisted: boolean;

  @Field(() => [TokenLimitInput], { nullable: true, defaultValue: [] })
  limits: TokenLimitInput[];
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

  spending?: SpendingConfigInput;
}

@ArgsType()
export class UpdateQuorumArgs extends QuorumGuidInput {
  // Defaults to the `key`
  @QuorumKeyField({ nullable: true })
  proposingQuorumKey?: QuorumKey;

  @SetField(() => AddressScalar, { min: 1 })
  approvers: Set<Address>;

  spending?: SpendingConfigInput;
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

  spending?: SpendingConfigInput;

  static toQuorum(q: QuorumInput, key: QuorumKey): Quorum {
    return {
      key,
      approvers: q.approvers,
      spending: {
        allowlisted: q.spending?.allowlisted ?? false,
        limits: Object.fromEntries(
          (q.spending?.limits ?? []).map((limit) => [limit.token, limit] as const),
        ),
      },
    };
  }

  toQuorum(key: QuorumKey) {
    return QuorumInput.toQuorum(this, key);
  }
}
