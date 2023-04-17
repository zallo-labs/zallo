import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequestTokensArgs } from './faucet.args';
import { Address } from 'lib';
import { FaucetService } from './faucet.service';
import { AddressScalar } from '~/apollo/scalars/Address.scalar';

@Resolver()
export class FaucetResolver {
  constructor(private service: FaucetService) {}

  @Query(() => [AddressScalar])
  async requestableTokens(@Args() { recipient }: RequestTokensArgs): Promise<Address[]> {
    return this.service.requestableTokens(recipient);
  }

  @Mutation(() => [AddressScalar])
  async requestTokens(@Args() { recipient }: RequestTokensArgs): Promise<Address[]> {
    return this.service.requestTokens(recipient);
  }
}
