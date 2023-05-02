import { Args, Info, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PrismaService } from '../util/prisma/prisma.service';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/select';
import { ContactsArgs, ContactArgs, UpsertContactArgs } from './contacts.args';
import { connectOrCreateUser } from '~/util/connect-or-create';
import { getUser } from '~/request/ctx';
import { AccountsService } from '../accounts/accounts.service';
import _ from 'lodash';
import { Contact } from './contacts.model';

@Resolver(() => Contact)
export class ContactsResolver {
  constructor(private prisma: PrismaService, private accounts: AccountsService) {}

  @ResolveField(() => String)
  id(@Parent() contact: Contact): string {
    return `${getUser()}-${contact.addr}`;
  }

  @Query(() => Contact, { nullable: true })
  async contact(
    @Args() { addr }: ContactArgs,
    @Info() info?: GraphQLResolveInfo,
  ): Promise<Contact | null> {
    return this.prisma.asUser.contact.findUnique({
      where: { userId_addr: { addr, userId: getUser() } },
      ...getSelect(info),
    });
  }

  @Query(() => [Contact])
  async contacts(@Args() args: ContactsArgs): Promise<Contact[]> {
    const contacts = await this.prisma.asUser.contact.findMany({
      ...args,
      select: { addr: true, name: true },
    });

    const accounts = await this.accounts.findMany({
      where: { id: { notIn: contacts.map((c) => c.addr) } },
      select: { id: true, name: true },
    });

    return [...contacts, ...accounts.map((a) => ({ ...a, addr: a.id }))];
  }

  @Mutation(() => Contact)
  async upsertContact(
    @Args() { prevAddr, newAddr, name }: UpsertContactArgs,
    @Info() info?: GraphQLResolveInfo,
  ): Promise<Contact> {
    // Ignore leading and trailing whitespace
    name = name.trim();

    const user = getUser();
    const selectArgs = getSelect(info);

    return this.prisma.asUser.contact.upsert({
      where: {
        userId_addr: {
          userId: user,
          addr: prevAddr ?? newAddr,
        },
      },
      create: {
        user: connectOrCreateUser(user),
        addr: newAddr,
        name,
      },
      update: {
        addr: { set: newAddr },
        name: { set: name },
      },
      ...(selectArgs && {
        select: _.omit(selectArgs.select, 'id'),
      }),
    });
  }

  @Mutation(() => Contact)
  async deleteContact(
    @Args() { addr }: ContactArgs,
    @Info() info?: GraphQLResolveInfo,
  ): Promise<Contact> {
    return this.prisma.asUser.contact.delete({
      where: {
        userId_addr: {
          userId: getUser(),
          addr,
        },
      },
      ...getSelect(info),
    });
  }
}
