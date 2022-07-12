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
import { Address, hashTx, Id, toId } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { UserAddr } from '~/decorators/user.decorator';
import {
  connectOrCreateUser,
  connectOrCreateSafe,
} from '~/util/connect-or-create';
import { getSelect } from '~/util/select';
import {
  ProposeTxArgs,
  ApproveArgs,
  TxsArgs,
  RevokeApprovalArgs,
  RevokeApprovalResp,
} from './txs.args';
import { Submission } from '@gen/submission/submission.model';
import { SubmissionsService } from '../submissions/submissions.service';

@Resolver(() => Tx)
export class TxsResolver {
  constructor(
    private prisma: PrismaService,
    private submissionsService: SubmissionsService,
  ) {}

  @Query(() => [Tx])
  async txs(
    @Args() { safe }: TxsArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Tx[]> {
    return (
      (await this.prisma.safe
        .findUnique({
          where: { id: safe },
        })
        .txs({
          ...getSelect(info),
        })) ?? []
    );
  }

  @ResolveField(() => String)
  id(@Parent() tx: Tx): Id {
    return this.toId(tx);
  }

  @ResolveField(() => [Submission])
  async submissions(@Parent() tx: Tx): Promise<Submission[]> {
    return await this.submissionsService.updateUnfinalized(
      tx.submissions ?? [],
    );
  }

  @Mutation(() => Tx)
  async proposeTx(
    @Args() { safe, tx, signature }: ProposeTxArgs,
    @Info() info: GraphQLResolveInfo,
    @UserAddr() user: Address,
  ): Promise<Tx> {
    const txHash = await hashTx(safe, tx);
    await this.verifySignatureOrThrow(signature, user, txHash);

    return this.prisma.tx.upsert({
      where: { safeId_hash: { hash: txHash, safeId: safe } },
      create: {
        safe: connectOrCreateSafe(safe),
        hash: txHash,
        to: tx.to,
        value: tx.value.toString(),
        data: tx.data,
        salt: tx.salt,
        approvals: {
          create: {
            user: connectOrCreateUser(user),
            safe: connectOrCreateSafe(safe),
            signature,
          },
        },
      },
      update: {
        approvals: {
          create: {
            user: connectOrCreateUser(user),
            safe: connectOrCreateSafe(safe),
            signature,
          },
        },
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => Tx, { nullable: true })
  async approve(
    @Args() { safe, txHash, signature }: ApproveArgs,
    @Info() info: GraphQLResolveInfo,
    @UserAddr() user: Address,
  ): Promise<Tx | null> {
    await this.verifySignatureOrThrow(signature, user, txHash);

    return this.prisma.tx.update({
      where: { safeId_hash: { safeId: safe, hash: txHash } },
      data: {
        approvals: {
          create: {
            safe: connectOrCreateSafe(safe),
            user: connectOrCreateUser(user),
            signature: ethers.utils.hexlify(signature),
          },
        },
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => RevokeApprovalResp)
  async revokeApproval(
    @Args() { safe, txHash }: RevokeApprovalArgs,
    @UserAddr() user: Address,
  ): Promise<RevokeApprovalResp> {
    const tx = await this.prisma.tx.update({
      where: { safeId_hash: { safeId: safe, hash: txHash } },
      data: {
        approvals: {
          delete: {
            safeId_txHash_userId: {
              safeId: safe,
              txHash,
              userId: user,
            },
          },
        },
      },
    });

    // Delete tx if no approvals are left
    const approvalsLeft = await this.prisma.approval.count({
      where: { safeId: safe, txHash },
    });

    if (!approvalsLeft)
      await this.prisma.tx.delete({
        where: { safeId_hash: { safeId: safe, hash: txHash } },
      });

    return { id: this.toId(tx) };
  }

  private async verifySignatureOrThrow(
    signature: BytesLike,
    user: Address,
    txHash: BytesLike,
  ) {
    // TODO: fix
    // if (!(await zk.utils.isMessageSignatureCorrect(user, txHash, signature)))
    //   throw new UserInputError('Invalid signature');
  }

  private toId({ safeId, hash }: { safeId: string; hash: string }): Id {
    return toId(`${safeId}-${hash}`);
  }
}
