import { Args, Info, Query, Resolver } from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/select';
import { GetAddrNameArgs } from './devices.input';
import { DeviceAddr } from '~/decorators/device.decorator';
import { Device } from '@gen/device/device.model';
import { Address } from 'lib';

@Resolver(() => Device)
export class DevicesResolver {
  constructor(private prisma: PrismaService) {}

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
