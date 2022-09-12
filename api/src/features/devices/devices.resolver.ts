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
import { UpsertOneDeviceArgs } from '@gen/device/upsert-one-device.args';
import { Address } from 'lib';
import { SubgraphService } from '../subgraph/subgraph.service';

@Resolver(() => Device)
export class DevicesResolver {
  constructor(
    private prisma: PrismaService,
    private subgraph: SubgraphService,
  ) {}

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

  @ResolveField(() => [Account])
  async accounts(
    @DeviceAddr() device: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account[]> {
    return this.prisma.account.findMany({
      where: {
        OR: [
          // Deployed account - approvers aren't stored
          // { id: { in: await this.subgraph.deviceAccounts(device) } },
          // Counterfactual accounts
          {
            wallets: {
              some: {
                approvers: {
                  some: {
                    deviceId: { equals: device },
                  },
                },
              },
            },
          },
        ],
      },
      distinct: 'id',
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

  @Mutation(() => Device)
  async upsertDevice(
    @Args() args: UpsertOneDeviceArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Device> {
    return this.prisma.device.upsert({
      ...args,
      ...getSelect(info),
    });
  }
}
