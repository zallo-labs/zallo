import {
  Args,
  Info,
  Mutation,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';

import { Account } from '@gen/account/account.model';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/select';
import { GetAddrNameArgs } from './devices.input';
import { DeviceAddr } from '~/decorators/device.decorator';
import { Device } from '@gen/device/device.model';
import { Address } from 'lib';
import { FindAccountsArgs } from '../accounts/accounts.args';
import { User } from '@gen/user/user.model';
import { FindUsersArgs } from '../users/users.args';

@Resolver(() => Device)
export class DevicesResolver {
  constructor(private prisma: PrismaService) {}

  @ResolveField(() => [Account])
  async accounts(
    @Args() args: FindAccountsArgs,
    @DeviceAddr() device: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account[]> {
    return this.prisma.account.findMany({
      ...args,
      where: {
        users: {
          some: { deviceId: device },
        },
      },
      ...getSelect(info),
    });
  }

  @ResolveField(() => [User])
  async users(
    @Args() args: FindUsersArgs,
    @DeviceAddr() device: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User[]> {
    return this.prisma.user.findMany({
      ...args,
      where: { deviceId: device },
      ...getSelect(info),
    });
  }

  @Query(() => Device, { nullable: true })
  async device(
    @DeviceAddr() device: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Device | null> {
    return this.prisma.device.findUnique({
      where: { id: device },
      ...getSelect(info),
    });
  }

  @Query(() => String, { nullable: true })
  async addrName(
    @Args() { addr }: GetAddrNameArgs,
    @DeviceAddr() device: string,
  ): Promise<string | null> {
    const contact = await this.prisma.contact.findUnique({
      where: {
        deviceId_addr: {
          deviceId: device,
          addr,
        },
      },
      select: { name: true },
    });

    if (contact) return contact.name;

    const account = await this.prisma.account.findUnique({
      where: { id: addr },
      select: { name: true },
    });

    return account?.name || null;
  }
}
