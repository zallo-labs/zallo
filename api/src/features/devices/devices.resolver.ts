import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/select';
import { GetAddrNameArgs, RegisterPushTokenArgs, SetDeviceNameArgs } from './devices.args';
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
    @DeviceAddr() device: Address,
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
  async setDeviceName(
    @Args() { name }: SetDeviceNameArgs,
    @DeviceAddr() device: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Device> {
    return this.prisma.device.upsert({
      where: { id: device },
      create: {
        id: device,
        name,
      },
      update: {
        name,
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => Boolean)
  async registerPushToken(
    @Args() { token: pushToken }: RegisterPushTokenArgs,
    @DeviceAddr() device: Address,
  ): Promise<true> {
    await this.prisma.device.upsert({
      where: { id: device },
      create: {
        id: device,
        pushToken,
      },
      update: { pushToken },
    });

    return true;
  }
}
