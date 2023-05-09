import { Args, Info, Mutation, Parent, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { UpdateUserArgs, UserArgs } from './users.args';
import { getUser } from '~/request/ctx';
import { User } from './users.model';
import { UsersService } from './users.service';
import { getShape } from '../database/database.select';
import { ComputedField } from '~/decorators/computed.decorator';
import e from '~/edgeql-js';

@Resolver(() => User)
export class UsersResolver {
  constructor(private service: UsersService) {}

  @Query(() => User)
  async user(@Args() { address = getUser() }: UserArgs, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(address, getShape(info));
  }

  @ComputedField<typeof e.User>(() => String, { name: true }, { nullable: true })
  async name(@Parent() user: User): Promise<string | null> {
    return this.service.name(user.address);
  }

  @Mutation(() => User)
  async updateUser(@Args() args: UpdateUserArgs, @Info() info: GraphQLResolveInfo) {
    const user = getUser();
    await this.service.upsert(user, args);

    return (await this.service.selectUnique(user, getShape(info)))!;
  }
}
