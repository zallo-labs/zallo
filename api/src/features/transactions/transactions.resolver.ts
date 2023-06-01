import { Query, Mutation, Resolver, Info } from '@nestjs/graphql';
import { Transaction } from './transactions.model';
import { TransactionsService } from './transactions.service';
import { Input } from '~/decorators/input.decorator';
import { ExecuteInput, TransactionInput } from './transactions.inputs';
import { GraphQLResolveInfo } from 'graphql';
import { getShape } from '../database/database.select';

@Resolver(() => Transaction)
export class TransactionsResolver {
  constructor(private service: TransactionsService) {}

  @Query(() => Transaction, { nullable: true })
  async transaction(@Input() { hash }: TransactionInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(hash, getShape(info));
  }

  @Mutation(() => Transaction, { nullable: true })
  async execute(@Input() { proposalHash }: ExecuteInput, @Info() info: GraphQLResolveInfo) {
    const txHash = await this.service.tryExecute(proposalHash);
    return this.service.selectUnique(txHash, getShape(info));
  }
}
