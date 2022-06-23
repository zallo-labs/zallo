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
import { Prisma } from '@prisma/client';
import { UserInputError } from 'apollo-server-core';
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
    @Args() { safe, ops, signature }: ProposeTxArgs,
    @Info() info: GraphQLResolveInfo,
    @UserAddr() user: Address,
  ): Promise<Tx> {
    if (!ops.length)
      throw new UserInputError(`At least one operation is required`);

    const txHash = await hashTx(safe, ...ops);
    await this.verifySignatureOrThrow(signature, user, txHash);

    return this.prisma.tx.upsert({
      where: { safeId_hash: { hash: txHash, safeId: safe } },
      create: {
        safe: connectOrCreateSafe(safe),
        hash: txHash,
        ops: {
          createMany: {
            data: await Promise.all(
              ops.map(
                async (op): Promise<Prisma.OpCreateManyTxInput> => ({
                  hash: await hashTx(safe, op),
                  to: op.to,
                  value: op.value.toString(),
                  data: ethers.utils.hexlify(op.data),
                  nonce: op.nonce.toString(),
                }),
              ),
            ),
          },
        },
        approvals: {
          create: {
            approver: connectOrCreateUser(user),
            safe: connectOrCreateSafe(safe),
            signature,
          },
        },
      },
      update: {
        approvals: {
          create: {
            approver: connectOrCreateUser(user),
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
            approver: connectOrCreateUser(user),
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
