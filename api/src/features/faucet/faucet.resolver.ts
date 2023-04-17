import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequestTokensArgs } from './faucet.args';
import { Address } from 'lib';
import { FaucetService } from './faucet.service';
import { AddressScalar } from '~/apollo/scalars/Address.scalar';

@Resolver()
export class FaucetResolver {
  constructor(private service: FaucetService) {}

  @Query(() => [AddressScalar])
  async requestableTokens(@Args() { account }: RequestTokensArgs): Promise<Address[]> {
    return this.service.requestableTokens(account);
  }

  @Mutation(() => [AddressScalar])
  async requestTokens(@Args() { account }: RequestTokensArgs): Promise<Address[]> {
    return this.service.requestTokens(account);
  }
}
