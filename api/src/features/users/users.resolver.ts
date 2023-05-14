import { Info, Mutation, Parent, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { UpdateUserInput, UserInput } from './users.input';
import { getUser } from '~/request/ctx';
import { User } from './users.model';
import { UsersService } from './users.service';
import { getShape } from '../database/database.select';
import { ComputedField } from '~/decorators/computed.decorator';
import e from '~/edgeql-js';
import { Input } from '~/decorators/input.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private service: UsersService) {}

  @Query(() => User)
  async user(
    @Input({ defaultValue: {} }) { address = getUser() }: UserInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.selectUnique(address, getShape(info));
  }

  @ComputedField<typeof e.User>(() => String, { name: true }, { nullable: true })
  async name(@Parent() user: User): Promise<string | null> {
    return this.service.name(user.address);
  }

  @Mutation(() => User)
  async updateUser(@Input() input: UpdateUserInput, @Info() info: GraphQLResolveInfo) {
    const user = getUser();
    await this.service.upsert(user, input);

    return (await this.service.selectUnique(user, getShape(info)))!;
  }
}
