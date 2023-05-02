import { ID, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Transaction } from './transactions.model';

@Resolver(() => Transaction)
export class TransactionsResolver {
  @ResolveField(() => ID, { description: 'hash' })
  id(@Parent() transaction: Transaction): string {
    return transaction.hash;
  }
}
