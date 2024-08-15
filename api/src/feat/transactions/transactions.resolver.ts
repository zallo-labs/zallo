import { Args, ID, Info, Mutation, Parent, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import {
  ExecuteTransactionInput,
  PrepareTransactionInput,
  ProposeCancelScheduledTransactionInput,
  ProposeTransactionInput,
  UpdateTransactionInput,
} from './transactions.input';
import {
  EstimatedTransactionFees,
  Transaction,
  TransactionPreparation,
  TransactionStatus,
} from './transactions.model';
import { TransactionsService } from './transactions.service';
import { getShape, Shape } from '~/core/database';
import e, { $infer } from '~/edgeql-js';
import { Input } from '~/common/decorators/input.decorator';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { ComputedField } from '~/common/decorators/computed.decorator';
import { ApproveInput } from '../proposals/proposals.input';
import { NodeArgs } from '../nodes/nodes.input';
import { asAddress, asHex, asUAddress, encodeOperations } from 'lib';
import Decimal from 'decimal.js';

const ESTIMATE_FEES_DEPS = {
  id: true,
  account: { address: true },
  operations: { to: true, data: true, value: true },
  paymasterEthFees: { activation: true },
  feeToken: { address: true },
} satisfies Shape<typeof e.Transaction>;
const s_ = e.assert_exists(e.assert_single(e.select(e.Transaction, () => ESTIMATE_FEES_DEPS)));
type EstimateFeesDeps = $infer<typeof s_>;

@Resolver(() => Transaction)
export class TransactionsResolver {
  constructor(private service: TransactionsService) {}

  @Query(() => Transaction, { nullable: true })
  async transaction(@Args() { id }: NodeArgs, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(id, getShape(info));
  }

  @Query(() => TransactionPreparation)
  async prepareTransaction(
    @Input() input: PrepareTransactionInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.prepareTransaction(input, getShape(info));
  }

  @ComputedField<typeof e.Transaction>(() => Boolean, { status: true })
  async updatable(@Parent() { status }: Transaction): Promise<boolean> {
    return status === TransactionStatus.Pending;
  }

  @ComputedField<typeof e.Transaction>(() => EstimatedTransactionFees, ESTIMATE_FEES_DEPS)
  async estimatedFees(@Parent() d: EstimateFeesDeps): Promise<EstimatedTransactionFees> {
    return {
      id: `EstimatedTransactionFees:${d.id}`,
      ...(await this.service.estimateFees({
        account: asUAddress(d.account.address),
        feeToken: asAddress(d.feeToken.address),
        paymasterEthFees: {
          activation: new Decimal(d.paymasterEthFees.activation),
        },
        ...encodeOperations(
          d.operations.map((op) => ({
            to: asAddress(op.to),
            data: asHex(op.data ?? '0x'),
            value: op.value ? BigInt(op.value) : undefined,
          })),
        ),
      })),
    };
  }

  @Mutation(() => Transaction)
  async proposeTransaction(
    @Input() input: ProposeTransactionInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    const id = await this.service.propose(input);
    return this.service.selectUnique(id, getShape(info));
  }

  @Mutation(() => Transaction)
  async proposeCancelScheduledTransaction(
    @Input() input: ProposeCancelScheduledTransactionInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    const id = await this.service.proposeCancelScheduledTransaction(input);
    return this.service.selectUnique(id, getShape(info));
  }

  @Mutation(() => Transaction)
  async approveTransaction(@Input() input: ApproveInput, @Info() info: GraphQLResolveInfo) {
    await this.service.approve(input);
    return this.service.selectUnique(input.id, getShape(info));
  }

  @Mutation(() => Transaction)
  async updateTransaction(
    @Input() input: UpdateTransactionInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    await this.service.update(input);
    return this.service.selectUnique(input.id, getShape(info));
  }

  @Mutation(() => ID, { nullable: true })
  async removeTransaction(@Args() { id }: NodeArgs): Promise<uuid | null> {
    return this.service.delete(id);
  }

  @Mutation(() => Transaction, { nullable: true })
  async execute(
    @Input() { id, ignoreSimulation }: ExecuteTransactionInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    this.service.tryExecute(id, ignoreSimulation);
    return this.service.selectUnique(id, getShape(info));
  }
}
