import { Context, Info, Mutation, Parent, Query, Resolver, Subscription } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';

import { ComputedField } from '~/decorators/computed.decorator';
import { Input } from '~/decorators/input.decorator';
import e from '~/edgeql-js';
import { asUser, GqlContext } from '~/request/ctx';
import { getShape } from '../database/database.select';
import { LinkInput, UpdateUserInput } from './users.input';
import { User } from './users.model';
import { UsersService, UserSubscriptionPayload } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private service: UsersService) {}

  @Query(() => User)
  async user(@Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(getShape(info));
  }

  @ComputedField<typeof e.User>(() => String, { id: true })
  async linkingToken(@Parent() { id }: User): Promise<string> {
    return this.service.getLinkingToken(id);
  }

  @Subscription(() => User, {
    name: 'user',
    resolve(
      this: UsersResolver,
      _payload: UserSubscriptionPayload,
      _input,
      ctx: GqlContext,
      info: GraphQLResolveInfo,
    ) {
      return asUser(ctx, () => this.service.selectUnique(getShape(info)));
    },
  })
  async subscribeToUser(@Context() ctx: GqlContext) {
    return asUser(ctx, () => this.service.subscribeToUser());
  }

  @Mutation(() => User)
  async updateUser(@Input() input: UpdateUserInput, @Info() info: GraphQLResolveInfo) {
    await this.service.update(input);
    return this.service.selectUnique(getShape(info));
  }

  @Mutation(() => User)
  async link(@Input() { token }: LinkInput, @Info() info: GraphQLResolveInfo) {
    await this.service.link(token);
    return this.service.selectUnique(getShape(info));
  }
}
