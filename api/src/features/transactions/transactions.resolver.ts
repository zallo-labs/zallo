import { Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';

import { Input } from '~/decorators/input.decorator';
import { getShape } from '../database/database.select';
import { ExecuteInput, TransactionInput } from './transactions.inputs';
import { Transaction } from './transactions.model';
import { TransactionsService } from './transactions.service';

@Resolver(() => Transaction)
export class TransactionsResolver {
  constructor(private service: TransactionsService) {}

  @Query(() => Transaction, { nullable: true })
  async transaction(@Input() { hash }: TransactionInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(hash, getShape(info));
  }

  // @Mutation(() => Transaction, { nullable: true })
  // async execute(@Input() { proposalHash }: ExecuteInput, @Info() info: GraphQLResolveInfo) {
  //   const txHash = await this.service.tryExecute(proposalHash);
  //   return this.service.selectUnique(txHash, getShape(info));
  // }
}
