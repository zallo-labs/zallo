import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';
import { GraphQLResolveInfo } from 'graphql';
import { Account } from '@gen/account/account.model';
import {
  AccountArgs,
  UpdateAccountMetadataArgs,
  CreateAccountArgs,
  AccountsArgs,
} from './accounts.args';
import { makeGetSelect } from '~/util/select';
import { AccountsService } from './accounts.service';
import { Prisma } from '@prisma/client';
import { ProviderService } from '~/features/util/provider/provider.service';
import {
  address,
  Address,
  calculateProxyAddress,
  Quorum,
  randomDeploySalt,
  toQuorumKey,
} from 'lib';
import { CONFIG } from '~/config';
import { UserId } from '~/decorators/user.decorator';
import { QuorumInput } from '../quorums/quorums.args';
import { FaucetService } from '../faucet/faucet.service';

const getSelect = makeGetSelect<{
  Account: Prisma.AccountSelect;
}>({
  Account: {},
});

@Resolver(() => Account)
export class AccountsResolver {
  constructor(
    private service: AccountsService,
    private prisma: PrismaService,
    private provider: ProviderService,
    private faucet: FaucetService,
  ) {}

  @Query(() => Account, { nullable: true })
  async account(
    @Args() { id }: AccountArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account | null> {
    return this.prisma.account.findUnique({
      where: { id },
      ...getSelect(info),
    });
  }

  @Query(() => [Account])
  async accounts(
    @Args() args: AccountsArgs,
    @Info() info: GraphQLResolveInfo,
    @UserId() user: Address,
  ): Promise<Account[]> {
    return this.service.accounts(user, { ...args, ...getSelect(info) });
  }

  @Mutation(() => Account)
  async createAccount(
    @Args() { name, quorums: quorumsArg }: CreateAccountArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account> {
    const impl = address(CONFIG.accountImplAddress);
    const deploySalt = randomDeploySalt();

    // Start key from 1 as apollo interprets key=0 as key=NaN for some reason?
    const quorums: Quorum[] = quorumsArg.map((q, i) => QuorumInput.toQuorum(q, toQuorumKey(i + 1)));

    const addr = await this.provider.useProxyFactory((factory) =>
      calculateProxyAddress({ impl, quorums }, factory, deploySalt),
    );

    const r = await this.prisma.account.create({
      data: {
        id: addr,
        deploySalt,
        impl,
        name,
        quorums: {
          create: quorums.map(
            (q, i) =>
              ({
                name: quorumsArg[i].name,
                key: q.key,
                states: {
                  create: {
                    approvers: { create: [...q.approvers].map((a) => ({ userId: a })) },
                    spendingFallback: q.spending?.fallback,
                    limits: q.spending?.limits
                      ? { createMany: { data: Object.values(q.spending.limits) } }
                      : undefined,
                  },
                },
              } as Prisma.QuorumCreateWithoutAccountInput),
          ),
        },
      },
      ...getSelect(info),
    });

    this.service.activateAccount(addr);
    this.faucet.requestTokens(addr);

    return r;
  }

  @Mutation(() => Boolean)
  async activateAccount(@Args() { id: id }: AccountArgs): Promise<true> {
    await this.service.activateAccount(id);
    return true;
  }

  @Mutation(() => Account)
  async updateAccountMetadata(
    @Args() { id, name }: UpdateAccountMetadataArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account> {
    return this.prisma.account.update({
      where: { id },
      data: { name },
      ...getSelect(info),
    });
  }
}
