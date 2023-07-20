import { ID, Info, Mutation, Parent, Query, Resolver } from '@nestjs/graphql';
import { Token } from './tokens.model';
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
import { ProviderService } from '../util/provider/provider.service';
import { PricesService } from '../prices/prices.service';
import { getUserCtx } from '~/request/ctx';
import { PaymasterService } from '../paymaster/paymaster.service';

@Resolver(() => Token)
export class TokensResolver {
  constructor(
    private service: TokensService,
    private provider: ProviderService,
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

  @ComputedField<typeof e.Token>(() => GraphQLBigInt, { address: true })
  async balance(
    @Parent() { address: token }: Token,
    @Input() { account }: BalanceInput,
  ): Promise<bigint> {
    return this.provider.balance({ account: account ?? getUserCtx().accounts[0].address, token });
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
