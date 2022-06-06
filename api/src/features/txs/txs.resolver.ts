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
import * as zk from 'zksync-web3';
import { GraphQLResolveInfo } from 'graphql';
import { Address, hashTx } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { UserAddr } from '~/decorators/user.decorator';
import {
  connectOrCreateApprover,
  connectOrCreateSafe,
} from '~/util/connect-or-create';
import { getSelect } from '~/util/test';
import {
  ProposeTxArgs,
  ApproveArgs,
  TxsArgs,
  RevokeApprovalArgs,
} from './txs.args';

@Resolver(() => Tx)
export class TxsResolver {
  constructor(private prisma: PrismaService) {}

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
  async id(@Parent() tx: Tx): Promise<string> {
    return `${tx.safeId}-${tx.hash}`;
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
            approver: connectOrCreateApprover(user),
            safe: connectOrCreateSafe(safe),
            signature,
          },
        },
      },
      update: {
        approvals: {
          create: {
            approver: connectOrCreateApprover(user),
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
            approver: connectOrCreateApprover(user),
            signature: ethers.utils.hexlify(signature),
          },
        },
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => Tx, { nullable: true })
  async revokeApproval(
    @Args() { safe, txHash }: RevokeApprovalArgs,
    @Info() info: GraphQLResolveInfo,
    @UserAddr() user: Address,
  ): Promise<Tx | null> {
    const tx = await this.prisma.tx.update({
      where: { safeId_hash: { safeId: safe, hash: txHash } },
      data: {
        approvals: {
          delete: {
            safeId_txHash_approverId: {
              safeId: safe,
              txHash,
              approverId: user,
            },
          },
        },
      },
      ...getSelect(info),
    });

    // Delete tx if no approvals are left
    const approvalsLeft = await this.prisma.approval.count({
      where: {
        safeId: safe,
        txHash,
      },
    });

    if (approvalsLeft) {
      return tx;
    } else {
      await this.prisma.tx.delete({
        where: { safeId_hash: { safeId: safe, hash: txHash } },
      });
      return null;
    }
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
}
