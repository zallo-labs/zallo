import { ID, Info, Mutation, Parent, Query, Resolver } from '@nestjs/graphql';
import { Token, TokenMetadata } from './tokens.model';
import { TokenSpending } from './spending.model';
import { Input } from '~/decorators/input.decorator';
import {
  BalanceInput,
  SpendingInput,
  TokenInput,
  TokensInput,
  UpsertTokenInput,
} from './tokens.input';
import { TokensService } from './tokens.service';
import { GraphQLResolveInfo } from 'graphql';
import { getShape } from '../database/database.select';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { Price } from '../prices/prices.model';
import { ComputedField } from '~/decorators/computed.decorator';
import e from '~/edgeql-js';
import * as eql from '~/edgeql-interfaces';
import { PricesService } from '../prices/prices.service';
import { PaymastersService } from '../paymasters/paymasters.service';
import { FeesPerGas } from '~/features/paymasters/paymasters.model';
import { DecimalScalar } from '~/apollo/scalars/Decimal.scalar';
import Decimal from 'decimal.js';

@Resolver(() => Token)
export class TokensResolver {
  constructor(
    private service: TokensService,
    private paymaster: PaymastersService,
    private prices: PricesService,
  ) {}

  @Query(() => Token, { nullable: true })
  async token(@Input() { address: testnetAddress }: TokenInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(testnetAddress, getShape(info));
  }

  @Query(() => [Token])
  async tokens(@Input({ defaultValue: {} }) input: TokensInput, @Info() info: GraphQLResolveInfo) {
    return this.service.select(input, getShape(info));
  }

  @Query(() => TokenMetadata)
  async tokenMetadata(@Input() { address }: TokenInput): Promise<TokenMetadata> {
    return { ...(await this.service.getTokenMetadata(address)), id: `TokenMetadata:${address}` };
  }

  @ComputedField<typeof e.Token>(() => DecimalScalar, { address: true })
  async balance(@Parent() { address }: Token, @Input() input: BalanceInput): Promise<Decimal> {
    return this.service.balance(address, input);
  }

  @ComputedField<typeof e.Token>(() => Price, { pythUsdPriceId: true }, { nullable: true })
  async price(@Parent() { pythUsdPriceId }: Token): Promise<Price | null> {
    if (!pythUsdPriceId) return null;
    return this.prices.price(pythUsdPriceId);
  }

  @ComputedField<typeof e.Token>(() => TokenSpending, { address: true })
  async spending(
    @Parent() { address }: Token,
    @Input() input: SpendingInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.spending(address, input, getShape(info));
  }

  @ComputedField<typeof e.Token>(
    () => FeesPerGas,
    { address: true, isFeeToken: true },
    { nullable: true },
  )
  async estimatedFeesPerGas(@Parent() { address, isFeeToken }: Token): Promise<FeesPerGas | null> {
    if (!isFeeToken) return null;
    return this.paymaster.estimateFeePerGas(address);
  }

  @ComputedField<typeof e.Token>(() => Boolean, { user: true })
  async userOwned(@Parent() { user }: eql.Token): Promise<boolean> {
    return !!user;
  }

  @Mutation(() => Token)
  async upsertToken(@Input() input: UpsertTokenInput, @Info() info: GraphQLResolveInfo) {
    await this.service.upsert(input);
    return this.service.selectUnique(input.address, getShape(info));
  }

  @Mutation(() => ID, { nullable: true })
  async removeToken(@Input() { address: testnetAddress }: TokenInput): Promise<uuid | null> {
    return this.service.remove(testnetAddress);
  }
}
