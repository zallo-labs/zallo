import { ID, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { ContactInput, ContactsInput, LabelInput, UpsertContactInput } from './contacts.input';
import { Contact } from './contacts.model';
import { ContactsService } from './contacts.service';
import { getShape } from '~/core/database';
import { Input } from '~/common/decorators/input.decorator';
import { uuid } from 'edgedb/dist/codecs/ifaces';

@Resolver(() => Contact)
export class ContactsResolver {
  constructor(private service: ContactsService) {}

  @Query(() => Contact, { nullable: true })
  async contact(@Input() { address }: ContactInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(address, getShape(info));
  }

  @Query(() => [Contact])
  async contacts(
    @Input({ defaultValue: {} }) input: ContactsInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.select(input, getShape(info));
  }

  @Query(() => String, { nullable: true })
  async label(@Input() { address }: LabelInput) {
    return this.service.label(address);
  }

  @Mutation(() => Contact)
  async upsertContact(@Input() input: UpsertContactInput, @Info() info: GraphQLResolveInfo) {
    const id = await this.service.upsert(input);
    return this.service.selectUnique(id, getShape(info));
  }

  @Mutation(() => ID, { nullable: true })
  async deleteContact(@Input() { address }: ContactInput): Promise<uuid | null> {
    return this.service.delete(address);
  }
}
