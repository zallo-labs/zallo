import { Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { UpdateUserInput } from './users.input';
import { User } from './users.model';
import { UsersService } from './users.service';
import { getShape } from '../database/database.select';
import { Input } from '~/decorators/input.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private service: UsersService) {}

  @Query(() => User)
  async user(@Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(getShape(info));
  }

  @Mutation(() => User)
  async updateUser(@Input() input: UpdateUserInput, @Info() info: GraphQLResolveInfo) {
    await this.service.update(input);
    return await this.service.selectUnique(getShape(info));
  }
}
