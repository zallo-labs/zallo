import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequestTokensInput } from './faucet.input';
import { Address } from 'lib';
import { FaucetService } from './faucet.service';
import { AddressScalar } from '~/common/scalars/Address.scalar';
import { Input } from '~/common/decorators/input.decorator';

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
