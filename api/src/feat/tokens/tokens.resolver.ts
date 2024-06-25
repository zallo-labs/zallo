import { Args, ID, Info, Mutation, Parent, Query, Resolver } from '@nestjs/graphql';
import { Token, TokenMetadata } from './tokens.model';
import { TokenSpending } from './spending.model';
import { Input } from '~/common/decorators/input.decorator';
import {
  BalanceInput,
  SpendingInput,
  TokenArgs,
  TokensInput,
  UpsertTokenInput,
} from './tokens.input';
import { TokensService } from './tokens.service';
import { GraphQLResolveInfo } from 'graphql';
import { getShape } from '../../core/database/database.select';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { Price } from '../prices/prices.model';
import { ComputedField } from '~/common/decorators/computed.decorator';
import e from '~/edgeql-js';
import * as eql from '~/edgeql-interfaces';
import { PricesService } from '../prices/prices.service';
import { PaymastersService } from '../paymasters/paymasters.service';
import { FeesPerGas } from '~/feat/paymasters/paymasters.model';
import { DecimalScalar } from '~/common/scalars/Decimal.scalar';
import Decimal from 'decimal.js';

@Resolver(() => Token)
export class TokensResolver {
  constructor(
    private service: TokensService,
    private paymaster: PaymastersService,
    private prices: PricesService,
  ) {}

  @Query(() => Token, { nullable: true })
  async token(@Args() { address }: TokenArgs, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(address, getShape(info));
  }

  @Query(() => [Token])
  async tokens(@Input({ defaultValue: {} }) input: TokensInput, @Info() info: GraphQLResolveInfo) {
    return this.service.select(input, getShape(info));
  }

  @Query(() => TokenMetadata, { nullable: true })
  async tokenMetadata(@Args() { address }: TokenArgs): Promise<TokenMetadata | null> {
    const m = await this.service.getTokenMetadata(address);
    return m ? { ...m, id: `TokenMetadata:${address}` } : null;
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
  async removeToken(@Args() { address }: TokenArgs): Promise<uuid | null> {
    return this.service.remove(address);
  }
}
