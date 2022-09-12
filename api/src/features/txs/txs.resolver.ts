import { Tx } from '@gen/tx/tx.model';
import {
  Args,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { BytesLike, ethers } from 'ethers';
import { GraphQLResolveInfo } from 'graphql';
import {
  Address,
  getTxId,
  hashTx,
  Id,
  SignatureLike,
  validateSignature,
} from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { DeviceAddr } from '~/decorators/device.decorator';
import {
  connectOrCreateDevice,
  connectOrCreateAccount,
  connectOrCreateWallet,
} from '~/util/connect-or-create';
import { getSelect } from '~/util/select';
import {
  ProposeTxArgs,
  ApproveArgs,
  RevokeApprovalResp,
  UniqueTxArgs,
  TxsArgs,
  ChangeTxWalletArgs,
} from './txs.args';
import { Submission } from '@gen/submission/submission.model';
import { SubmissionsService } from '../submissions/submissions.service';
import { UserInputError } from 'apollo-server-core';
import { ProviderService } from '~/provider/provider.service';

@Resolver(() => Tx)
export class TxsResolver {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    private submissionsService: SubmissionsService,
  ) {}

  @Query(() => Tx, { nullable: true })
  async tx(
    @Args() { account, hash }: UniqueTxArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Tx | null> {
    return this.prisma.tx.findUnique({
      where: {
        accountId_hash: { accountId: account, hash },
      },
      ...getSelect(info),
    });
  }

  @Query(() => [Tx])
  async txs(
    @Args() { accounts }: TxsArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Tx[]> {
    return (
      (await this.prisma.tx.findMany({
        where: {
          accountId: { in: accounts },
        },
        ...getSelect(info),
      })) ?? []
    );
  }

  @ResolveField(() => String)
  id(@Parent() tx: Tx): Id {
    return getTxId(tx.accountId, tx.hash);
  }

  @ResolveField(() => [Submission])
  async submissions(@Parent() tx: Tx): Promise<Submission[]> {
    return await this.submissionsService.updateUnfinalized(
      tx.submissions ?? [],
    );
  }

  @Mutation(() => Tx)
  async proposeTx(
    @Args() { account, walletRef, tx, signature }: ProposeTxArgs,
    @Info() info: GraphQLResolveInfo,
    @DeviceAddr() device: Address,
  ): Promise<Tx> {
    const txHash = await hashTx(
      { address: account, provider: this.provider },
      tx,
    );
    await this.validateSignatureOrThrow(device, txHash, signature);

    return this.prisma.tx.upsert({
      where: { accountId_hash: { hash: txHash, accountId: account } },
      create: {
        account: connectOrCreateAccount(account),
        hash: txHash,
        to: tx.to,
        value: tx.value.toString(),
        data: tx.data,
        salt: tx.salt,
        wallet: connectOrCreateWallet(account, walletRef),
        approvals: {
          create: {
            user: connectOrCreateDevice(device),
            account: connectOrCreateAccount(account),
            signature,
          },
        },
      },
      update: {
        approvals: {
          create: {
            user: connectOrCreateDevice(device),
            account: connectOrCreateAccount(account),
            signature,
          },
        },
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => Tx, { nullable: true })
  async approve(
    @Args() { account, hash, signature }: ApproveArgs,
    @Info() info: GraphQLResolveInfo,
    @DeviceAddr() device: Address,
  ): Promise<Tx | null> {
    await this.validateSignatureOrThrow(device, hash, signature);

    return this.prisma.tx.update({
      where: { accountId_hash: { accountId: account, hash } },
      data: {
        approvals: {
          create: {
            account: connectOrCreateAccount(account),
            user: connectOrCreateDevice(device),
            signature: ethers.utils.hexlify(signature),
          },
        },
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => RevokeApprovalResp)
  async revokeApproval(
    @Args() { account, hash }: UniqueTxArgs,
    @DeviceAddr() device: Address,
  ): Promise<RevokeApprovalResp> {
    await this.prisma.tx.update({
      where: { accountId_hash: { accountId: account, hash } },
      data: {
        approvals: {
          delete: {
            accountId_txHash_deviceId: {
              accountId: account,
              txHash: hash,
              deviceId: device,
            },
          },
        },
      },
    });

    // Delete tx if no approvals are left
    const approvalsLeft = await this.prisma.approval.count({
      where: { accountId: account, txHash: hash },
    });

    if (!approvalsLeft)
      await this.prisma.tx.delete({
        where: { accountId_hash: { accountId: account, hash } },
      });

    return { id: getTxId(account, hash) };
  }

  @Mutation(() => Tx, { nullable: true })
  async setTxWallet(
    @Args() { account, hash, walletRef }: ChangeTxWalletArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Tx | null> {
    return this.prisma.tx.update({
      where: {
        accountId_hash: {
          accountId: account,
          hash,
        },
      },
      data: {
        wallet: connectOrCreateWallet(account, walletRef),
      },
      ...getSelect(info),
    });
  }

  private async validateSignatureOrThrow(
    device: Address,
    txHash: BytesLike,
    signature: SignatureLike,
  ) {
    const isValid = validateSignature(device, txHash, signature);
    if (!isValid) throw new UserInputError('Invalid signature');
  }
}
