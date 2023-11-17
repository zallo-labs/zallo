import { ID, Info, Mutation, Parent, Query, Resolver } from '@nestjs/graphql';
import { Token, TokenMetadata } from './tokens.model';
import { Input } from '~/decorators/input.decorator';
import { BalanceInput, TokenInput, TokensInput, UpsertTokenInput } from './tokens.input';
import { TokensService } from './tokens.service';
import { GraphQLResolveInfo } from 'graphql';
import { getShape } from '../database/database.select';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { Price } from '../prices/prices.model';
import { ComputedField } from '~/decorators/computed.decorator';
import { GraphQLBigInt } from 'graphql-scalars';
import e from '~/edgeql-js';
import * as eql from '~/edgeql-interfaces';
import { NetworksService } from '../util/networks/networks.service';
import { PricesService } from '../prices/prices.service';
import { getUserCtx } from '~/request/ctx';
import { PaymasterService } from '../paymaster/paymaster.service';
import { asAddress } from 'lib';

@Resolver(() => Token)
export class TokensResolver {
  constructor(
    private service: TokensService,
    private networks: NetworksService,
    private paymaster: PaymasterService,
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

  @ComputedField<typeof e.Token>(() => GraphQLBigInt, { address: true })
  async balance(
    @Parent() { address: token }: Token,
    @Input() { account = getUserCtx().accounts[0]?.address }: BalanceInput,
  ): Promise<bigint> {
    if (!account) return 0n;

    return this.networks.for(account).balance({ account, token: asAddress(token) });
  }

  @ComputedField<typeof e.Token>(
    () => Price,
    { address: true, ethereumAddress: true },
    { nullable: true },
  )
  async price(@Parent() { address, ethereumAddress }: Token): Promise<Price | null> {
    return this.prices.price(address, ethereumAddress);
  }

  @ComputedField<typeof e.Token>(
    () => GraphQLBigInt,
    { address: true, isFeeToken: true },
    { nullable: true },
  )
  async gasPrice(@Parent() { address, isFeeToken }: Token): Promise<bigint | null> {
    if (!isFeeToken) return null;
    return this.paymaster.getGasPrice(address);
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
