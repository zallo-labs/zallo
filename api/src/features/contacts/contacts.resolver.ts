import {
  Args,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Contact } from '@gen/contact/contact.model';
import { PrismaService } from 'nestjs-prisma';
import { FindUniqueContactArgs } from '@gen/contact/find-unique-contact.args';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/select';
import { UserAddr } from '~/decorators/user.decorator';
import { Address, Id, toId } from 'lib';
import {
  ContactsArgs,
  DeleteContactArgs,
  DeleteContactResp,
  UpsertContactArgs,
} from './contacts.args';
import { connectOrCreateUser } from '~/util/connect-or-create';

@Resolver(() => Contact)
export class ContactsResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => Contact, { nullable: true })
  async contact(
    @Args() args: FindUniqueContactArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Contact | null> {
    return this.prisma.contact.findUnique({
      ...args,
      ...getSelect(info),
    });
  }

  @Query(() => [Contact])
  async contacts(
    @Args() args: ContactsArgs,
    @Info() info: GraphQLResolveInfo,
    @UserAddr() user: Address,
  ): Promise<Contact[]> {
    return this.prisma.contact.findMany({
      ...args,
      where: { userId: user },
      ...getSelect(info),
    });
  }

  @ResolveField(() => String)
  id(@Parent() contact: Contact, @UserAddr() user: Address): Id {
    return toId(`${contact.userId || user}-${contact.addr}`);
  }

  @Mutation(() => Contact, { nullable: true })
  async upsertContact(
    @Args() args: UpsertContactArgs,
    @Info() info: GraphQLResolveInfo,
    @UserAddr() user: Address,
  ): Promise<Contact | null> {
    const { prevAddr, newAddr, name } = args;
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
      },
      update: {
        addr: { set: newAddr },
        name: { set: name },
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => DeleteContactResp)
  async deleteContact(
    @Args() { addr }: DeleteContactArgs,
    @UserAddr() user: Address,
  ): Promise<DeleteContactResp> {
    await this.prisma.contact.delete({
      where: {
        userId_addr: {
          userId: user,
          addr,
        },
      },
    });

    return {
      id: toId(`${user}-${addr}`),
    };
  }
}
