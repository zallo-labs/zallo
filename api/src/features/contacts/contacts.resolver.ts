import { Args, Info, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/select';
import { UserId } from '~/decorators/user.decorator';
import { Address, filterFirst, Id, toId } from 'lib';
import { ContactsArgs, ContactArgs, ContactObject, UpsertContactArgs } from './contacts.args';
import { connectOrCreateUser } from '~/util/connect-or-create';
import { AccountsService } from '../accounts/accounts.service';
import { Prisma } from '@prisma/client';

@Resolver(() => ContactObject)
export class ContactsResolver {
  constructor(private prisma: PrismaService, private accountsService: AccountsService) {}

  @ResolveField(() => String)
  id(@Parent() contact: ContactObject, @UserId() user: Address): Id {
    return toId(`${user}-${contact.addr}`);
  }

  @Query(() => ContactObject, { nullable: true })
  async contact(
    @Args() { addr }: ContactArgs,
    @UserId() user: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<ContactObject | null> {
    return this.prisma.contact.findUnique({
      where: {
        userId_addr: { addr, userId: user },
      },
      ...getSelect(info),
    });
  }

  @Query(() => [ContactObject])
  async contacts(@Args() args: ContactsArgs, @UserId() user: Address): Promise<ContactObject[]> {
    const contacts = await this.prisma.contact.findMany({
      ...args,
      where: { userId: user },
      select: { addr: true, name: true },
    });

    const accounts = await this.accountsService.accounts(user, {
      select: { id: true, name: true },
    });

    return filterFirst(
      [...contacts, ...accounts.map((a) => ({ addr: a.id, name: a.name }))],
      (contact) => contact.addr,
    );
  }

  @Mutation(() => ContactObject)
  async upsertContact(
    @Args() { prevAddr, newAddr, name }: UpsertContactArgs,
    @UserId() user: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<ContactObject> {
    return this.prisma.contact.upsert({
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
      } as Prisma.ContactCreateInput,
      update: {
        addr: { set: newAddr },
        name: { set: name },
      } as Prisma.ContactUpdateInput,
      // ...getSelect(info),  // Causes can't find 'id' field error; note. 'id' is a @ResolveField
    });
  }

  @Mutation(() => Boolean)
  async deleteContact(
    @Args() { addr }: ContactArgs,
    @UserId() user: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<boolean> {
    await this.prisma.contact.delete({
      where: {
        userId_addr: {
          userId: user,
          addr,
        },
      },
      ...getSelect(info),
    });

    return true;
  }
}
