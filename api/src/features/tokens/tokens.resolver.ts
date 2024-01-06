import { ID, Info, Mutation, Parent, Query, Resolver } from '@nestjs/graphql';
import Decimal from 'decimal.js';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { GraphQLResolveInfo } from 'graphql';

import { asAddress, asChain, asDecimal } from 'lib';
import { DecimalScalar } from '~/apollo/scalars/Decimal.scalar';
import { ComputedField } from '~/decorators/computed.decorator';
import { Input } from '~/decorators/input.decorator';
import * as eql from '~/edgeql-interfaces';
import e from '~/edgeql-js';
import { FeesPerGas } from '~/features/paymasters/paymasters.model';
import { BalancesService } from '~/features/util/balances/balances.service';
import { getUserCtx } from '~/request/ctx';
import { getShape } from '../database/database.select';
import { PaymastersService } from '../paymasters/paymasters.service';
import { Price } from '../prices/prices.model';
import { PricesService } from '../prices/prices.service';
import { BalanceInput, TokenInput, TokensInput, UpsertTokenInput } from './tokens.input';
import { Token, TokenMetadata } from './tokens.model';
import { TokensService } from './tokens.service';

@Resolver(() => Token)
export class TokensResolver {
  constructor(
    private service: TokensService,
    private paymaster: PaymastersService,
    private balances: BalancesService,
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

  @ComputedField<typeof e.Token>(() => DecimalScalar, { address: true, decimals: true })
  async balance(
    @Parent() { address: token, decimals }: Token,
    @Input() { account = getUserCtx().accounts[0]?.address }: BalanceInput,
  ): Promise<Decimal> {
    if (!account || asChain(token) !== asChain(account)) return new Decimal(0);

    const balance = await this.balances.balance({ account, token: asAddress(token) });
    return asDecimal(balance, decimals);
  }

  @ComputedField<typeof e.Token>(() => Price, { pythUsdPriceId: true }, { nullable: true })
  async price(@Parent() { pythUsdPriceId }: Token): Promise<Price | null> {
    if (!pythUsdPriceId) return null;
    return this.prices.price(pythUsdPriceId);
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
    const { id } = await this.service.upsert(input);
    return this.service.selectUnique(id, getShape(info));
  }

  @Mutation(() => ID, { nullable: true })
  async removeToken(@Input() { address: testnetAddress }: TokenInput): Promise<uuid | null> {
    return this.service.remove(testnetAddress);
  }
}
