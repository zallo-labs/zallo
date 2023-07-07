import { Info, Mutation, Parent, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { PairInput, UpdateUserInput } from './users.input';
import { User } from './users.model';
import { UsersService } from './users.service';
import { getShape } from '../database/database.select';
import { Input } from '~/decorators/input.decorator';
import { ComputedField } from '~/decorators/computed.decorator';
import e from '~/edgeql-js';

@Resolver(() => User)
export class UsersResolver {
  constructor(private service: UsersService) {}

  @Query(() => User)
  async user(@Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(getShape(info));
  }

  @ComputedField<typeof e.User>(() => String, { id: true })
  async pairingToken(@Parent() { id }: User): Promise<string> {
    return this.service.getPairingToken(id);
  }

  @Mutation(() => User)
  async updateUser(@Input() input: UpdateUserInput, @Info() info: GraphQLResolveInfo) {
    await this.service.update(input);
    return this.service.selectUnique(getShape(info));
  }

  @Mutation(() => User, { description: 'Pair with another user - merging your approvers' })
  async pair(@Input() { token }: PairInput, @Info() info: GraphQLResolveInfo) {
    await this.service.pair(token);
    return this.service.selectUnique(getShape(info));
  }
}
