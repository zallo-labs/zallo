import { Args, Info, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/select';
import { DeviceArgs, RegisterPushTokenArgs, SetDeviceNameArgs } from './devices.args';
import { DeviceAddr } from '~/decorators/device.decorator';
import { Device } from '@gen/device/device.model';
import { Address } from 'lib';

@Resolver(() => Device)
export class DevicesResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => Device, { nullable: true })
  async device(
    @Args() { addr }: DeviceArgs,
    @DeviceAddr() device: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Device | null> {
    return this.prisma.device.findUnique({
      where: { id: addr || device },
      ...getSelect(info),
    });
  }

  @ResolveField(() => String, { nullable: true })
  async name(@Parent() device: Device, @DeviceAddr() userDevice: Address): Promise<string | null> {
    const contact = this.prisma.contact.findUnique({
      where: { deviceId_addr: { deviceId: userDevice, addr: device.id } },
      select: { name: true },
    });

    const account = this.prisma.account.findUnique({
      where: { id: device.id },
      select: { name: true },
    });

    const user = this.prisma.user.findFirst({
      where: {
        deviceId: device.id,
        account: {
          users: { some: { deviceId: userDevice } },
        },
      },
      select: { name: true },
    });

    return (
      (await contact)?.name || (await account)?.name || device.name || (await user)?.name || null
    );
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
