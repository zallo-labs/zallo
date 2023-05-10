import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { ContactArgs, UpsertContactArgs } from './contacts.args';
import { Contact } from './contacts.model';
import { ContactsService } from './contacts.service';
import { getShape } from '../database/database.select';

@Resolver(() => Contact)
export class ContactsResolver {
  constructor(private service: ContactsService) {}

  @Query(() => Contact, { nullable: true })
  async contact(@Args() { address }: ContactArgs, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(address, getShape(info));
  }

  @Query(() => [Contact])
  async contacts(@Info() info: GraphQLResolveInfo) {
    return this.service.select(getShape(info));
  }

  @Mutation(() => Contact)
  async upsertContact(@Args() args: UpsertContactArgs, @Info() info: GraphQLResolveInfo) {
    const id = await this.service.upsert(args);
    return this.service.selectUnique(id, getShape(info));
  }

  @Mutation(() => Contact)
  async deleteContact(@Args() { address }: ContactArgs, @Info() info: GraphQLResolveInfo) {
    const id = await this.service.delete(address);
    return this.service.selectUnique(id, getShape(info));
  }
}
