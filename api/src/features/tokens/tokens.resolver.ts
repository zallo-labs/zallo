import { ID, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Token } from './tokens.model';
import { Input } from '~/decorators/input.decorator';
import { TokenInput, UpsertTokenInput } from './tokens.input';
import { TokensService } from './tokens.service';
import { GraphQLResolveInfo } from 'graphql';
import { getShape } from '../database/database.select';
import { uuid } from 'edgedb/dist/codecs/ifaces';

@Resolver(() => Token)
export class TokensResolver {
  constructor(private service: TokensService) {}

  @Query(() => Token, { nullable: true })
  async token(@Input() { testnetAddress }: TokenInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(testnetAddress, getShape(info));
  }

  @Query(() => [Token])
  async tokens(@Info() info: GraphQLResolveInfo) {
    return this.service.select(getShape(info));
  }

  @Mutation(() => Token)
  async upsertToken(@Input() input: UpsertTokenInput, @Info() info: GraphQLResolveInfo) {
    const { id } = await this.service.upsert(input);
    return this.service.selectUnique(id, getShape(info));
  }

  @Mutation(() => ID, { nullable: true })
  async removeToken(@Input() { testnetAddress }: TokenInput): Promise<uuid | null> {
    return this.service.remove(testnetAddress);
  }
}
