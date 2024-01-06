import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { Address } from 'lib';
import { AddressScalar } from '~/apollo/scalars/Address.scalar';
import { Input } from '~/decorators/input.decorator';
import { RequestTokensInput } from './faucet.input';
import { FaucetService } from './faucet.service';

@Resolver()
export class FaucetResolver {
  constructor(private service: FaucetService) {}

  @Query(() => [AddressScalar])
  async requestableTokens(@Input() { account }: RequestTokensInput): Promise<Address[]> {
    return this.service.requestableTokens(account);
  }

  @Mutation(() => [AddressScalar])
  async requestTokens(@Input() { account }: RequestTokensInput): Promise<Address[]> {
    return this.service.requestTokens(account);
  }
}
