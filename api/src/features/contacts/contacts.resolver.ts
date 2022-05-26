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
import { getSelect } from '~/util/test';
import { UserAddr } from '~/decorators/user.decorator';
import { Address, Id, toId } from 'lib';
import {
  Contacts2Args,
  DeleteContactArgs,
  DeleteContactResp,
  UpsertContactArgs,
} from './contacts.args';

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
    @Args() args: Contacts2Args,
    @Info() info: GraphQLResolveInfo,
    @UserAddr() user: Address,
  ): Promise<Contact[]> {
    return this.prisma.contact.findMany({
      ...args,
      ...getSelect(info),
      where: {
        approverId: user,
      },
    });
  }

  @ResolveField(() => String)
  id(@Parent() contact: Contact, @UserAddr() user: Address): Id {
    return toId(`${contact.approverId || user}-${contact.addr}`);
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
        approverId_addr: {
          approverId: user,
          addr: prevAddr ?? newAddr,
        },
      },
      create: {
        approver: {
          connectOrCreate: {
            where: { id: user },
            create: { id: user },
          },
        },
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
        approverId_addr: {
          approverId: user,
          addr,
        },
      },
    });

    return {
      id: toId(`${user}-${addr}`),
    };
  }
}
